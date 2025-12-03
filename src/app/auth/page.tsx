'use client'

import { Federant } from 'next/font/google';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../../services/supabaseClient';

const federant = Federant({
    subsets: ['latin'],
    weight: ['400'],
});


export default function Login() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const backgroundVideoRef = useRef<HTMLVideoElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard/`
      }
    })

    if (error) {
      console.error('Error signing in with Google:', error.message);
    }
  }

  // Array of your video files
  const videos: string[] = [
    '/signin-img/signin1.mp4',
    '/signin-img/signin2.mp4',
    '/signin-img/signin3.mp4',
    '/signin-img/signin4.mp4',
    '/signin-img/signin5.mp4',
    '/signin-img/signin6.mp4',
    '/signin-img/signin7.mp4'
  ];

  // Optimized video switching
  const switchVideo = useCallback((index: number): void => {
    setCurrentVideoIndex(index);

    // Ensure only current video plays
    videoRefs.current.forEach((video: HTMLVideoElement | null, i: number) => {
      if (video) {
        if (i === index) {
          video.currentTime = 0;
          video.play().catch((error: Error) => console.error('Video play error:', error));
        } else {
          video.pause();
        }
      }
    });
  }, []);

  // Auto-advance carousel
  useEffect((): (() => void) => {
    if (isLoaded) {
      intervalRef.current = setInterval((): void => {
        setCurrentVideoIndex((prev: number): number => {
          const next: number = (prev + 1) % videos.length;
          switchVideo(next);
          return next;
        });
      }, 4000); // 4 seconds for smoother experience
    }

    return (): void => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLoaded, switchVideo, videos.length]);

  // Handle manual navigation
  const goToVideo = useCallback((index: number): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    switchVideo(index);

    // Restart auto-advance after manual interaction
    setTimeout((): void => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval((): void => {
        setCurrentVideoIndex((prev: number): number => {
          const next: number = (prev + 1) % videos.length;
          switchVideo(next);
          return next;
        });
      }, 4000);
    }, 2000);
  }, [switchVideo, videos.length]);

  // Initialize first video
  useEffect((): (() => void) => {
    const timer: NodeJS.Timeout = setTimeout((): void => {
      setIsLoaded(true);
      switchVideo(0);
    }, 500);

    return (): void => clearTimeout(timer);
  }, [switchVideo]);

  // Handle video ref assignment
  const setVideoRef = useCallback((el: HTMLVideoElement | null, index: number): void => {
    videoRefs.current[index] = el;
  }, []);


  return (
    <div className="h-screen bg-gradient-to-br from-white via-sky-100 to-cyan-100 overflow-hidden">
      <div className="h-screen flex">
        {/* Left Side - Sign In Component */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="relative z-10">
            <div className="text-center mb-8">
              {/* Logo */}
              <div className="flex items-center gap-3 cursor-pointer group justify-center mb-4">
                <img
                  src="/logo.png"
                  alt="Hireonic Logo"
                  width={50}
                  height={75}
                  className='rounded-xl'
                />
                <span className={`text-3xl bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-600 bg-clip-text text-transparent font-bold ${federant.className}`}>
                  Talk2Hire
                </span>
              </div>

              <div className="w-full max-w-md border-2 rounded-3xl p-9 bg-white/10 backdrop-blur-sm bg-gradient-to-br from-cyan-50/30 via-sky-50/20 to-blue-50/30">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 via-blue-600 to-sky-600 rounded-2xl mb-6 shadow-2xl">
                  <video
                    src="/signin-img/signin-icon.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-2xl border"
                    aria-label="Sign in animation"
                  />
                </div>

                <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-600 bg-clip-text text-transparent mb-2">
                  Sign In
                </h3>
                <p className="text-slate-700">Access your recruitment command center</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10  backdrop-blur-sm p-4 rounded-xl border-cyan-200/40 hover:border-cyan-300/60 ">
                    <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                      2M+
                    </div>
                    <div className="text-sm text-slate-600">Profiles Analyzed</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500/10 to-sky-500/10 backdrop-blur-sm p-4 rounded-xl border border-white/30">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                      98%
                    </div>
                    <div className="text-sm text-slate-600">Success Rate</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="group w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-sky-600 text-white p-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 mb-6 relative overflow-hidden cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  aria-label="Continue with Google"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
                      <i className="ri-google-fill text-blue-500 text-xl" aria-hidden="true"></i>
                    </div>
                    <span className="font-bold">Continue with Google</span>
                    <i className="ri-arrow-right-line text-xl group-hover:translate-x-1 transition-transform" aria-hidden="true"></i>
                  </div>
                </button>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <i className="ri-shield-check-line text-green-500" aria-hidden="true"></i>
                    <span className="text-sm">Enterprise-grade security</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <i className="ri-time-line text-blue-500" aria-hidden="true"></i>
                    <span className="text-sm">Instant access to AI tools</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <i className="ri-team-line text-purple-500" aria-hidden="true"></i>
                    <span className="text-sm">Collaborative hiring workspace</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Video Container */}
        <div className="flex-1 relative overflow-hidden">
          <video
            ref={backgroundVideoRef}
            src="/signin-img/signin-background.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover will-change-auto"
            style={{ transform: 'translateZ(0)' }} // Hardware acceleration
            aria-label="Background video"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-l from-purple-900/30 to-transparent z-10 pointer-events-none"></div>

          {/* 3D Sphere Carousel Container */}
          <div className="absolute inset-0 z-20 flex items-center justify-center p-8 pointer-events-none" style={{ perspective: '1500px' }}>
            <div className="relative pointer-events-auto" style={{ transformStyle: 'preserve-3d' }}>
              {/* Enhanced Glowing Background */}
              <div className="absolute -inset-8 bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -inset-6 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl"></div>

              {/* Main 3D Carousel Container - No Border */}
              <div className="relative w-[550px] h-[400px] rounded-3xl" style={{ transformStyle: 'preserve-3d' }}>

                {/* 3D Video Sphere Container */}
                <div className="relative w-full h-full rounded-3xl overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
                  {videos.map((videoSrc: string, index: number) => {
                    const isActive = index === currentVideoIndex;

                    // Calculate 3D position around sphere
                    const angleStep = (360 / videos.length) * (Math.PI / 180);
                    const currentAngle = (index - currentVideoIndex + videos.length) % videos.length;
                    const rotationY = currentAngle * angleStep;

                    const radius = 200;
                    const x = Math.sin(rotationY) * radius;
                    const z = Math.cos(rotationY) * radius;

                    let transformStyle = '';
                    let opacity = 0.4;
                    let scale = 0.6;
                    let brightness = 0.7;

                    if (isActive) {
                      // Active video in center front
                      transformStyle = 'translateX(0px) translateY(0px) translateZ(120px) rotateY(0deg) scale(1)';
                      opacity = 1;
                      scale = 1;
                      brightness = 1;
                    } else {
                      // Position videos in 3D circle around sphere
                      const videoRotationY = (rotationY * 180) / Math.PI;
                      transformStyle = `translateX(${x}px) translateY(0px) translateZ(${z - 80}px) rotateY(${videoRotationY}deg) scale(${scale})`;

                      // Adjust opacity and brightness based on Z position
                      const normalizedZ = (z + radius) / (2 * radius);
                      opacity = Math.max(0.2, normalizedZ * 0.8);
                      brightness = Math.max(0.5, normalizedZ);

                      // Hide videos that are too far back or to the sides
                      if (z < -100 || Math.abs(x) > 300) {
                        opacity = 0;
                      }
                    }

                    return (
                      <video
                        key={`${videoSrc}-${index}`}
                        ref={(el: HTMLVideoElement | null) => setVideoRef(el, index)}
                        src={videoSrc}
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 w-full h-full object-cover will-change-transform transition-all duration-1500 ease-in-out rounded-2xl shadow-xl"
                        style={{
                          transform: transformStyle,
                          opacity: opacity,
                          zIndex: isActive ? 30 : Math.max(1, Math.floor(15 + z / 20)),
                          filter: `brightness(${brightness})`,
                          transformStyle: 'preserve-3d',
                          transformOrigin: 'center center',
                          backfaceVisibility: 'hidden'
                        }}
                        aria-label={`Carousel video ${index + 1}`}
                      />
                    );
                  })}
                </div>

                {/* Sphere Lighting Effects - Only visible behind non-active videos */}
                <div className="absolute inset-0 pointer-events-none z-5">
                  {/* Top highlight - Reduced opacity */}
                  <div className="absolute top-10 left-1/2 w-32 h-16 bg-white/20 rounded-full blur-3xl transform -translate-x-1/2 animate-pulse"></div>
                  {/* Bottom shadow - Reduced opacity */}
                  <div className="absolute bottom-10 left-1/2 w-48 h-10 bg-black/30 rounded-full blur-2xl transform -translate-x-1/2"></div>
                  {/* Rim lighting - Reduced opacity */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400/10 via-transparent to-cyan-400/10 blur-sm"></div>
                  {/* Central glow - Reduced opacity */}
                  <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}