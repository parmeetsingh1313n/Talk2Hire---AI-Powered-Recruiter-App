import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ... (Keep facialExpressions and visemeToMorphTargets constants unchanged)
const facialExpressions = {
    default: {},
    professional: {
        browInnerUp: 0.05,
        eyeSquintLeft: 0.1,
        eyeSquintRight: 0.1,
        mouthSmileLeft: 0.2,
        mouthSmileRight: 0.2,
    },
    thoughtful: {
        browInnerUp: 0.3,
        eyeSquintLeft: 0.2,
        eyeSquintRight: 0.2,
        jawForward: 0.2,
        mouthFunnel: 0.3,
    },
    smile: {
        browInnerUp: 0.17,
        eyeSquintLeft: 0.4,
        eyeSquintRight: 0.44,
        mouthSmileLeft: 0.61,
        mouthSmileRight: 0.41,
    },
    sad: {
        mouthFrownLeft: 1,
        mouthFrownRight: 1,
        browInnerUp: 0.452,
        eyeSquintLeft: 0.72,
        eyeSquintRight: 0.75,
    },
    surprised: {
        eyeWideLeft: 0.5,
        eyeWideRight: 0.5,
        jawOpen: 0.351,
        mouthFunnel: 1,
        browInnerUp: 1,
    },
    angry: {
        browDownLeft: 1,
        browDownRight: 1,
        eyeSquintLeft: 1,
        eyeSquintRight: 1,
        jawForward: 1,
    },
};

const visemeToMorphTargets = {
    sil: {},
    PP: { mouthClose: 0.5, mouthPressLeft: 0.3, mouthPressRight: 0.3 },
    FF: { mouthShrugUpper: 0.4, mouthRollUpper: 0.3, mouthClose: 0.2 },
    TH: { jawOpen: 0.2, mouthOpen: 0.2 },
    DD: { jawOpen: 0.25, mouthOpen: 0.2 },
    kk: { jawOpen: 0.3, mouthOpen: 0.2 },
    CH: { mouthFunnel: 0.4, mouthPucker: 0.4, jawOpen: 0.1 },
    SS: {
        mouthShrugLower: 0.4,
        mouthClose: 0.3,
        mouthSmileLeft: 0.2,
        mouthSmileRight: 0.2,
    },
    nn: { mouthOpen: 0.2, jawOpen: 0.15 },
    RR: { mouthShrugLower: 0.3, mouthFunnel: 0.2, jawOpen: 0.1 },
    aa: { jawOpen: 0.45, mouthOpen: 0.35 },
    E: {
        mouthSmileLeft: 0.3,
        mouthSmileRight: 0.3,
        jawOpen: 0.25,
        mouthOpen: 0.2,
    },
    I: {
        jawOpen: 0.2,
        mouthOpen: 0.15,
        mouthSmileLeft: 0.2,
        mouthSmileRight: 0.2,
    },
    O: { mouthFunnel: 0.5, mouthPucker: 0.4, jawOpen: 0.25 },
    U: { mouthFunnel: 0.6, mouthPucker: 0.6, jawOpen: 0.1 },
};
const ANIMATION_SETS = {
    randomIdle: ["Nail", "Stretching", "Dwarf", "Thoughtful", "Angry", "InsectIdle"],
    talking: [
        "Talking_0",
        "Talking_1",
        "Talking_2",
        "Talking_3",
        "Angry"
    ],
};

interface AvatarProps {
    isSpeaking?: boolean;
    isProcessing?: boolean;
    currentViseme?: string;
    facialExpression?: string;
    isListening?: boolean;
    hasPendingMessage?: boolean;
    onAvatarReady?: () => void;
    position?: [number, number, number];
    scale?: [number, number, number];
}

export function Avatar({
    isSpeaking = false,
    isProcessing = false,
    currentViseme = "sil",
    facialExpression = "professional",
    onAvatarReady,
    isListening = false,
    hasPendingMessage = false,
    ...props
}: AvatarProps) {
    const { nodes, materials, scene } = useGLTF(
        "/models/64f1a714fe61576b46f27ca2.glb"
    ) as any;
    const { animations } = useGLTF("/models/animation.glb");
    const group = useRef<THREE.Group>(null);
    const { actions } = useAnimations(animations, group);

    const [blink, setBlink] = useState(false);
    const currentAnim = useRef("");
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const talkingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const forcedIdleRef = useRef(false);
    const hasWavedRef = useRef(false);
    const idleSequenceStep = useRef(0);

    // --- MATERIAL & EYE FIX ---
    useEffect(() => {
        scene.traverse((child: any) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                if (child.name.includes('Eye') || child.name.includes('Cornea')) {
                    child.material.transparent = false;
                    child.material.depthWrite = true;
                    child.material.color = new THREE.Color(1.1, 1.1, 1.1);
                }

                if (child.name.includes('Teeth')) {
                    child.material.transparent = false;
                    child.material.depthWrite = true;
                }

                if (child.name.includes('Body') || child.name.includes('Head')) {
                    if (child.material.roughness !== undefined) {
                        child.material.roughness = 0.6;
                        child.material.envMapIntensity = 0.5;
                    }
                }
            }
        });
    }, [scene]);

    const getRandomAnimation = useCallback((list: string[]) => {
        return list[Math.floor(Math.random() * list.length)];
    }, []);

    // --- ADVANCED SMOOTH ANIMATION SWITCHER ---
    const switchAnimation = useCallback(
        (newAnimName: string, fadeDuration: number = 0.5) => {
            if (currentAnim.current === newAnimName) return;

            const newAction = actions[newAnimName];
            const oldAction = actions[currentAnim.current];

            if (!newAction) {
                console.warn(`Animation ${newAnimName} not found`);
                return;
            }

            console.log(`🎬 Smooth Switch: ${currentAnim.current} -> ${newAnimName} (${fadeDuration}s)`);

            // 1. Prepare New Animation
            newAction.reset();
            newAction.setLoop(THREE.LoopRepeat, Infinity);
            newAction.clampWhenFinished = false;
            newAction.play(); // Start playing immediately

            // 2. Crossfade Logic
            if (oldAction && oldAction !== newAction) {
                // Crossfade handles the weight blending automatically
                oldAction.crossFadeTo(newAction, fadeDuration, true);
            } else {
                // If no previous animation, just fade in
                newAction.fadeIn(fadeDuration);
            }

            currentAnim.current = newAnimName;
        },
        [actions]
    );

    // --- IDLE CYCLE LOGIC ---
    const playIdleLoop = useCallback(() => {
        if (!forcedIdleRef.current) return;

        let nextAnimName = "Standing_Idle";
        const step = idleSequenceStep.current;

        // Sequence: Standing -> Idle -> Standing -> Random -> Repeat
        if (step === 0 || step === 2) {
            nextAnimName = "Standing_Idle";
        } else if (step === 1) {
            nextAnimName = "Idle";
        } else if (step === 3) {
            nextAnimName = getRandomAnimation(ANIMATION_SETS.randomIdle);
        }

        // Use a slow, relaxing fade (1.0s) for idle movements
        switchAnimation(nextAnimName, 1.0);

        idleSequenceStep.current = (step + 1) % 4;
        idleTimerRef.current = setTimeout(playIdleLoop, 6000); // 6s per idle animation

    }, [switchAnimation, getRandomAnimation]);


    // --- MAIN STATE CONTROLLER ---
    useEffect(() => {
        // CLEANUP TIMERS
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }
        if (talkingTimerRef.current) {
            clearTimeout(talkingTimerRef.current);
            talkingTimerRef.current = null;
        }

        // 1. TALKING STATE (START)
        if (isSpeaking) {
            forcedIdleRef.current = false;

            const playTalkingLoop = () => {
                if (!forcedIdleRef.current) {
                    const nextTalk = getRandomAnimation(ANIMATION_SETS.talking);
                    // Standard smooth fade (0.5s) between talking gestures
                    switchAnimation(nextTalk, 0.5);

                    const nextDuration = 3000 + Math.random() * 3000;
                    talkingTimerRef.current = setTimeout(playTalkingLoop, nextDuration);
                }
            };

            // Start Talking: Fast but smooth fade (0.4s) - No Jerk
            const firstAnim = getRandomAnimation(ANIMATION_SETS.talking);
            switchAnimation(firstAnim, 0.4);
            talkingTimerRef.current = setTimeout(playTalkingLoop, 3000);
        }

        // 2. THINKING STATE
        else if (isProcessing || hasPendingMessage) {
            forcedIdleRef.current = false;
            switchAnimation("Thoughtful", 0.5);
        }

        // 3. IDLE STATE (TTS STOPPED)
        else {
            console.log("🛑 TTS Stopped -> Transitioning to Angry");
            forcedIdleRef.current = true;

            // FIRST MOUNT
            if (!hasWavedRef.current && actions["Waving"]) {
                hasWavedRef.current = true;
                switchAnimation("Waving", 0.0); // Immediate for first load

                idleSequenceStep.current = 0;
                idleTimerRef.current = setTimeout(() => {
                    playIdleLoop();
                }, 3500);
            }
            // STOPPED TALKING -> SMOOTH FADE TO ANGRY
            else {
                // >>> THE FIX: Fast Smooth Fade (0.4s) instead of Hard Cut <<<
                // This eliminates the jerk but keeps it responsive.
                switchAnimation("Angry", 0.4);

                // Reset idle cycle
                idleSequenceStep.current = 0;

                // Hold Angry for 3.5s, then blend into standard idle
                idleTimerRef.current = setTimeout(() => {
                    playIdleLoop();
                }, 3500);
            }
        }

        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            if (talkingTimerRef.current) clearTimeout(talkingTimerRef.current);
        };
    }, [isSpeaking, isProcessing, hasPendingMessage, switchAnimation, playIdleLoop, getRandomAnimation, actions]);


    // INITIALIZATION
    useEffect(() => {
        if (scene && onAvatarReady) {
            onAvatarReady();
        }
    }, [scene, onAvatarReady]);

    // BLINKING
    useEffect(() => {
        let blinkTimeout: NodeJS.Timeout;
        const nextBlink = () => {
            blinkTimeout = setTimeout(() => {
                setBlink(true);
                setTimeout(() => {
                    setBlink(false);
                    nextBlink();
                }, 100);
            }, 2000 + Math.random() * 3000);
        };
        nextBlink();
        return () => clearTimeout(blinkTimeout);
    }, []);


    // MORPH TARGETS
    const lerpMorphTarget = useCallback(
        (target: string, value: number, speed = 0.15) => {
            scene.traverse((child: any) => {
                if (child.isSkinnedMesh && child.morphTargetDictionary) {
                    const index = child.morphTargetDictionary[target];
                    if (index !== undefined && child.morphTargetInfluences[index] !== undefined) {
                        child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
                            child.morphTargetInfluences[index],
                            value,
                            speed
                        );
                    }
                }
            });
        },
        [scene]
    );

    useFrame(() => {
        lerpMorphTarget("eyeBlinkLeft", blink ? 1 : 0, 0.3);
        lerpMorphTarget("eyeBlinkRight", blink ? 1 : 0, 0.3);

        if (nodes.EyeLeft && nodes.EyeLeft.morphTargetDictionary) {
            Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
                if (key.includes("Blink") || key.includes("mouth") || key.includes("jaw")) return;
                // @ts-ignore
                const mapping = facialExpressions[facialExpression] || {};
                const targetValue = mapping[key] || 0;
                lerpMorphTarget(key, targetValue, 0.05);
            });
        }

        if ((isSpeaking || isProcessing) && currentViseme && currentViseme !== "sil") {
            // @ts-ignore
            const visemeMapping = visemeToMorphTargets[currentViseme] || {};

            Object.keys(visemeMapping).forEach((target) => {
                let speed = 0.2;
                if (currentViseme === 'PP' || currentViseme === 'FF') speed = 0.5;
                if (currentViseme === 'aa' || currentViseme === 'O') speed = 0.25;
                lerpMorphTarget(target, visemeMapping[target], speed);
            });

            Object.keys(nodes.Wolf3D_Head.morphTargetDictionary).forEach((key) => {
                if (key.includes("mouth") || key.includes("jaw")) {
                    if (!visemeMapping[key]) {
                        lerpMorphTarget(key, 0, 0.2);
                    }
                }
            });
        } else {
            Object.keys(nodes.Wolf3D_Head.morphTargetDictionary).forEach((key) => {
                if (key.includes("mouth") || key.includes("jaw")) {
                    // @ts-ignore
                    const expressionMapping = facialExpressions[facialExpression] || {};
                    if (expressionMapping[key]) {
                        lerpMorphTarget(key, expressionMapping[key], 0.1);
                    } else {
                        lerpMorphTarget(key, 0, 0.1);
                    }
                }
            });
        }
    });

    return (
        <group {...props} dispose={null} ref={group}>
            <primitive object={nodes.Hips} />
            <skinnedMesh
                name="Wolf3D_Body"
                geometry={nodes.Wolf3D_Body.geometry}
                material={materials.Wolf3D_Body}
                skeleton={nodes.Wolf3D_Body.skeleton}
            />
            <skinnedMesh
                name="Wolf3D_Outfit_Bottom"
                geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
                material={materials.Wolf3D_Outfit_Bottom}
                skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
            />
            <skinnedMesh
                name="Wolf3D_Outfit_Footwear"
                geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
                material={materials.Wolf3D_Outfit_Footwear}
                skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
            />
            <skinnedMesh
                name="Wolf3D_Outfit_Top"
                geometry={nodes.Wolf3D_Outfit_Top.geometry}
                material={materials.Wolf3D_Outfit_Top}
                skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
            />
            <skinnedMesh
                name="Wolf3D_Hair"
                geometry={nodes.Wolf3D_Hair.geometry}
                material={materials.Wolf3D_Hair}
                skeleton={nodes.Wolf3D_Hair.skeleton}
            />
            <skinnedMesh
                name="EyeLeft"
                geometry={nodes.EyeLeft.geometry}
                material={materials.Wolf3D_Eye}
                skeleton={nodes.EyeLeft.skeleton}
                morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
                morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
            />
            <skinnedMesh
                name="EyeRight"
                geometry={nodes.EyeRight.geometry}
                material={materials.Wolf3D_Eye}
                skeleton={nodes.EyeRight.skeleton}
                morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
                morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
            />
            <skinnedMesh
                name="Wolf3D_Head"
                geometry={nodes.Wolf3D_Head.geometry}
                material={materials.Wolf3D_Skin}
                skeleton={nodes.Wolf3D_Head.skeleton}
                morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
                morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
            />
            <skinnedMesh
                name="Wolf3D_Teeth"
                geometry={nodes.Wolf3D_Teeth.geometry}
                material={materials.Wolf3D_Teeth}
                skeleton={nodes.Wolf3D_Teeth.skeleton}
                morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
                morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
            />
        </group>
    );
}

useGLTF.preload("/models/64f1a714fe61576b46f27ca2.glb");
useGLTF.preload("/models/animation.glb");