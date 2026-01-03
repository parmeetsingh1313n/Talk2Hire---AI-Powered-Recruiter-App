'use client';
import 'regenerator-runtime/runtime';
import { ContactShadows, Environment, OrbitControls, PerspectiveCamera, useTexture } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Avatar } from './Avatar';

function RoomBackground() {
    // Make sure "interview-room-bg.jpg" is in your public folder
    const texture = useTexture('/interview-room-bg.jpg');
    const { scene } = useThree();

    useEffect(() => {
        texture.colorSpace = THREE.SRGBColorSpace;
        // Make the background look crisp
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        scene.background = texture;
        scene.environment = texture;
    }, [texture, scene]);

    return null;
}

interface AvatarSceneProps {
    isSpeaking: boolean;
    isProcessing: boolean;
    currentViseme: string;
    facialExpression?: string;
    isListening: boolean;
    hasPendingMessage: boolean;
    onAvatarReady?: () => void;
}

export function AvatarScene({
    isSpeaking = false,
    isProcessing = false,
    currentViseme = 'sil',
    facialExpression = 'professional',
    isListening = false,
    hasPendingMessage = false,
    onAvatarReady
}: AvatarSceneProps) {
    const controlsRef = useRef<any>();

    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
    }, []);

    return (
        <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-gray-700/50 relative bg-black">
            <Canvas
                shadows
                dpr={[1, 2]}
                camera={{
                    // PASSPORT FRAMING LOGIC:
                    // Position Z=2.8 moves closer (Zoom in).
                    // Position Y=0.2 lifts camera slightly to eye level.
                    position: [0, 0.2, 2.8],
                    fov: 30, // 30mm Portrait Lens
                    near: 0.1,
                    far: 1000
                }}
                gl={{
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.15,
                }}
            >
                <Suspense fallback={null}>
                    <RoomBackground />

                    <PerspectiveCamera
                        makeDefault
                        position={[0, 0.2, 2.8]}
                        fov={30}
                    />

                    {/* AVATAR POSITIONING:
                       Y = -1.45: Cuts the model exactly at the waist/belt line.
                       Scale = 1.2: Makes the model fill the frame nicely.
                    */}
                    <Avatar
                        position={[0, -1.45, 0]}
                        scale={[1.2, 1.2, 1.2]}
                        isSpeaking={isSpeaking}
                        isProcessing={isProcessing}
                        currentViseme={currentViseme}
                        facialExpression={facialExpression}
                        isListening={isListening}
                        hasPendingMessage={hasPendingMessage}
                        onAvatarReady={onAvatarReady}
                    />

                    <OrbitControls
                        ref={controlsRef}
                        enableZoom={false}
                        enablePan={false}
                        enableRotate={true}
                        // Target Y=0.35 ensures we rotate around the FACE, not the center of the scene
                        target={[0, 0.35, 0]}
                        minPolarAngle={Math.PI / 2.2}
                        maxPolarAngle={Math.PI / 1.8}
                        minAzimuthAngle={-Math.PI / 12}
                        maxAzimuthAngle={Math.PI / 12}
                    />

                    {/* STUDIO LIGHTING SETUP */}
                    {/* Key Light (Front Right - Warm) */}
                    <directionalLight
                        position={[-1, 2, 3]}
                        intensity={1.6}
                        color="#fff0e6"
                        castShadow
                        shadow-bias={-0.0001}
                    />

                    {/* Fill Light (Left - Cool) */}
                    <directionalLight
                        position={[2, 1, 2]}
                        intensity={0.7}
                        color="#dbeaff"
                    />

                    {/* Hair/Rim Light (Back - Bright White) */}
                    <spotLight
                        position={[0, 4, -2]}
                        intensity={3.5}
                        color="#ffffff"
                        angle={0.6}
                        penumbra={0.5}
                    />

                    <ambientLight intensity={0.45} />
                    <Environment preset="city" />

                    <ContactShadows
                        opacity={0.4}
                        scale={10}
                        blur={2.5}
                        far={4}
                        resolution={256}
                        color="#000000"
                        position={[0, -1.45, 0]}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}