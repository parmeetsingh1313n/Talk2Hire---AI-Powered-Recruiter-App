'use client'
import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Federant } from 'next/font/google';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const federant = Federant({ subsets: ['latin'], weight: ['400'], });

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();

  const Header = () => {
    const headerTransform = useTransform(scrollY, [0, 50, 100], [0, 0.5, 1]);
    const headerWidth = useTransform(headerTransform, [0, 1], ['100%', '95%']);
    const headerMargin = useTransform(headerTransform, [0, 1], ['0px', '16px']);
    const borderRadius = useTransform(headerTransform, [0, 1], ['0px', '24px']);
    const backgroundColor = useTransform(headerTransform, [0, 0.3, 1], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.85)', 'rgba(255,255,255,0.95)']);
    const backdropBlur = useTransform(headerTransform, [0, 1], [0, 20]);

    return (
      <motion.header className="fixed top-0 left-0 right-0 z-50" style={{ paddingTop: headerMargin, paddingLeft: headerMargin, paddingRight: headerMargin, }}>
        <motion.div className="border border-cyan-200/40 mx-auto shadow-lg" style={{ width: headerWidth, borderRadius: borderRadius, backgroundColor: backgroundColor, backdropFilter: useTransform(backdropBlur, (value) => `blur(${value}px)`), willChange: 'transform', }}>
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              <motion.a href="/" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <div className="flex items-center gap-3 cursor-pointer group">
                  <img src="/logo.png" alt="logo" width={50} height={75} className='rounded-xl' />
                  <span className={`text-3xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-bold ${federant.className}`}>Talk2Hire</span>
                </div>
              </motion.a>

              <nav className="hidden md:flex items-center gap-8">
                {['Features', 'How It Works', 'Pricing', 'About'].map((item, index) => {
                  const href = item === 'How It Works' ? '#how-it-works' : `#${item.toLowerCase()}`;
                  return (
                    <motion.a key={item} href={href} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} className="relative text-slate-600 hover:text-blue-600 font-semibold cursor-pointer group transition-colors duration-300">
                      {item}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full group-hover:w-full transition-all duration-300"></span>
                    </motion.a>
                  );
                })}
              </nav>

              <div className="hidden md:flex items-center gap-4">
                <motion.a href="/login" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
                  <Link href={"/auth"}><button className="px-6 py-3 text-slate-600 hover:text-blue-600 rounded-xl backdrop-blur-xl bg-white/60 border border-cyan-200/60 transition-all duration-300 cursor-pointer font-semibold hover:shadow-lg">Login</button></Link>
                </motion.a>
                <motion.a href="/signup" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
                  <Link href={"/auth"}><button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 cursor-pointer"><i className="ri-rocket-line text-xl"></i> Get Started</button></Link>
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.header>
    );
  }

  const Stars = () => {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-300/60 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    );
  };

  // Dynamic Image Carousel Component
  const DynamicImageCarousel = () => {
    const images = [
      './hero-section-img/agent1.jpg',
      './hero-section-img/agent2.jpg',
      './hero-section-img/agent3.jpg',
      './hero-section-img/agent4.jpg',
      './hero-section-img/agent5.jpg',
      './hero-section-img/agent6.jpg',
      './hero-section-img/agent7.jpg',
      './hero-section-img/agent8.jpg',
      './hero-section-img/agent9.jpg',
      './hero-section-img/agent10.jpg',
      './hero-section-img/agent11.jpg',
      './hero-section-img/agent12.jpg',
      './hero-section-img/agent13.jpg',
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(1);

    const startAutoSlide = async () => {
      while (true) {
        await new Promise(resolve => setTimeout(resolve, 4000));
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
    };

    useEffect(() => {
      startAutoSlide();
    }, []);

    const slideVariants = {
      enter: {
        opacity: 0,
        scale: 0.3,
      },
      center: {
        opacity: 1,
        scale: 1,
      },
      exit: {
        opacity: 0,
        scale: 1.2,
      },
    };

    const swipeConfidenceThreshold = 10000;
    interface SwipePowerParams {
      offset: number;
      velocity: number;
    }

    const swipePower = (offset: number, velocity: number): number => {
      return Math.abs(offset) * velocity;
    };

    interface PaginateFn {
      (newDirection: number): void;
    }

    const paginate: PaginateFn = (newDirection) => {
      setDirection(newDirection);
      setCurrentIndex((prev: number) => {
        if (newDirection === 1) {
          return (prev + 1) % images.length;
        } else {
          return prev === 0 ? images.length - 1 : prev - 1;
        }
      });
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotateY: 45 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="flex-1 hidden lg:block relative"
      >
        <div className="relative mt-7 transform shadow-2xl transition-transform duration-300 hover:translate-x-2 group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>

          <div className="relative z-10 bg-white/90 backdrop-blur-2xl rounded-3xl p-3 border border-cyan-200/40 shadow-2xl overflow-hidden h-[500px]">
            <div className="relative w-full h-full flex items-center justify-center">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={currentIndex}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);
                    if (swipe < -swipeConfidenceThreshold) {
                      paginate(1);
                    } else if (swipe > swipeConfidenceThreshold) {
                      paginate(-1);
                    }
                  }}
                  className="absolute inset-4"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-xl border border-cyan-100">
                    <img
                      src={images[currentIndex]}
                      alt={`AI Agent ${currentIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-400/80 rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${10 + i * 10}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.4, 0.9, 0.4],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.8,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Optimized Hero section
  const HeroSection = () => {
    const heroTransform = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
    const blurValue = useTransform(heroTransform, [0, 1], [0, 4]);
    const opacityValue = useTransform(heroTransform, [0, 1], [1, 0.7]);
    const scaleValue = useTransform(heroTransform, [0, 1], [1, 0.98]);

    return (
      <motion.section style={{ filter: useTransform(blurValue, (value) => `blur(${value}px)`), opacity: opacityValue, scale: scaleValue, willChange: 'transform', }} className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-white via-sky-50 to-cyan-50">

        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,.08)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

        <motion.div
          className="absolute top-10 -right-48 w-96 h-96 rounded-full bg-gradient-to-r from-cyan-200/30 to-blue-200/30 blur-3xl"
          animate={{
            x: [0, 40, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-20 -left-32 w-64 h-64 rounded-full bg-gradient-to-r from-sky-200/30 to-cyan-200/30 blur-3xl"
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <Stars />

        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(600px circle at 0% 0%, rgba(6, 182, 212, 0.15), transparent 40%)' }}></div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
          <img
            src="/watermark.jpg"
            alt=""
            className="opacity-3 w-full h-full object-contain select-none transform rotate-12 grayscale"
          />
        </div>

        <div className="container mx-auto px-6 relative z-10 mt-12">
          <div className="flex items-center justify-between min-h-[80vh] gap-4 ml-3">
            <div className="flex-1 max-w-4xl">
              <motion.h1
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                className="text-4xl md:text-7xl font-black text-slate-800 mt-8 leading-none tracking-tight"
              >
                <span className="block">Future of</span>
                <div className="block bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-600 bg-clip-text text-transparent relative transition-transform duration-300 hover:scale-105 p-2">
                  AI Recruiting
                  <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/15 to-blue-400/15 blur-2xl -z-10 rounded-2xl"></div>
                </div>
              </motion.h1>
              <br />
              <motion.p
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed max-w-4xl font-medium"
              >
                Revolutionary AI-powered interview platform with{' '}
                <span className="text-cyan-600 font-bold">real-time avatars</span>,
                intelligent resume analysis, and immersive recruitment experiences that transform how organizations discover exceptional talent.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                className="flex flex-col sm:flex-row gap-6 mb-12"
              >
                <button className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-10 py-5 rounded-2xl text-xl font-bold shadow-xl cursor-pointer overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Link href={"/auth"}>
                    <span className="flex items-center gap-3 relative z-10">
                      <i className="ri-rocket-line text-xl"></i> Start Creating Interviews
                    </span>
                  </Link>
                </button>
                <button className="group relative border-2 border-cyan-400/60 text-slate-700 hover:text-blue-700 px-8 py-5 rounded-2xl text-xl font-bold bg-white/80 backdrop-blur-xl hover:bg-white/90 transition-all duration-300 cursor-pointer overflow-hidden transform hover:scale-105 shadow-lg hover:shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="flex items-center gap-3 relative z-10">
                    <i className="ri-play-circle-line text-xl"></i> Watch Interactive Demo
                  </span>
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
                className="flex flex-wrap items-center gap-8 text-slate-600"
              >
                <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-200">
                  <i className="ri-shield-check-line text-xl text-emerald-600"></i>
                  <span className="font-semibold">Enterprise Security</span>
                </div>
                <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200">
                  <i className="ri-speak-line text-xl text-blue-600"></i>
                  <span className="font-semibold">Real-time Processing</span>
                </div>
                <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-200">
                  <i className="ri-global-line text-xl text-cyan-600"></i>
                  <span className="font-semibold">Global Reach</span>
                </div>
              </motion.div>
            </div>

            <DynamicImageCarousel />
          </div>
        </div>
      </motion.section>
    );
  };

  // Animated counter component
  const AnimatedCounter = ({ end, suffix = '', duration = 2000 }: { end: number, suffix?: string, duration?: number }) => {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, amount: 0.5 })

    useEffect(() => {
      if (inView) {
        let startTime: number | null = null
        const animate = (currentTime: number) => {
          if (startTime === null) startTime = currentTime
          const progress = Math.min((currentTime - startTime) / duration, 1)
          setCount(Math.floor(progress * end))
          if (progress < 1) {
            requestAnimationFrame(animate)
          }
        }
        requestAnimationFrame(animate)
      }
    }, [inView, end, duration])

    return (
      <div ref={ref} className="text-5xl font-black text-slate-800 mb-4 text-center">
        <span>{count.toLocaleString()}</span>
        <span>{suffix}</span>
      </div>
    )
  }

  interface FeatureCardProps {
    icon: string | React.ReactNode
    title: string
    description: string
    gradient: string
    image: string
    alt: string
    badge: string
    delay?: number
  }

  const FeatureCard = ({ icon, title, description, gradient, image, alt, badge, delay = 0 }: FeatureCardProps) => {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, amount: 0.3 })

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay }}
        className="group relative bg-white/90 backdrop-blur-2xl rounded-3xl p-8 border border-cyan-200/60 shadow-xl transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-2xl hover:scale-105 hover:bg-white/95"
      >
        <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl`}></div>

        <div className="relative mb-6 rounded-2xl overflow-hidden">
          <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-cyan-50 flex items-center justify-center text-slate-400 text-center p-4 border border-cyan-100">
            <img src={image} alt={alt} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent"></div>
          <div className="absolute top-4 right-4 bg-cyan-500/90 backdrop-blur-xl text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            {badge}
          </div>
        </div>

        <div className={`w-16 h-16 rounded-2xl ${gradient.replace('bg-gradient-to-br', 'bg-gradient-to-r')} flex items-center justify-center mb-6 shadow-xl`}>
          <span className="text-2xl text-white">
            {typeof icon === 'string' ? icon : icon}
          </span>
        </div>

        <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 group-hover:bg-clip-text transition-all duration-300">
          {title}
        </h3>

        <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
          {description}
        </p>

        <motion.div
          initial={{ width: '0%' }}
          animate={inView ? { width: '100%' } : {}}
          transition={{ duration: 1, delay: delay + 0.5 }}
          className={`absolute bottom-0 left-0 h-1 ${gradient.replace('bg-gradient-to-br', 'bg-gradient-to-r')} rounded-b-3xl`}
        />
      </motion.div>
    )
  }

  interface HowItWorksStepProps {
    number: string
    icon: React.ReactNode | string
    title: string
    description: string
    features: string[]
    gradient: string
    image: string
    alt: string
    direction?: 'left' | 'right'
    delay?: number
  }

  const HowItWorksStep = ({ number, icon, title, description, features, gradient, image, alt, direction = 'left', delay = 0 }: HowItWorksStepProps) => {
    const ref = useRef(null)
    const inView = useInView(ref, { once: false, amount: 0.2 })

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: direction === 'left' ? -100 : 100, y: 30 }}
        animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
        transition={{ duration: 0.8, delay }}
        className={`flex items-center gap-16 mb-24 ${direction === 'right' ? 'flex-row-reverse' : ''} group`}
      >
        <div className="flex-1 relative z-10 transition-transform duration-300 hover:-translate-y-2">
          <div className={`absolute -inset-8 ${gradient} rounded-3xl blur-2xl opacity-15`}></div>

          <div className="flex items-center gap-6 mb-8">
            <div className={`w-20 h-20 ${gradient.replace('bg-gradient-to-r', 'bg-gradient-to-r')} rounded-2xl flex items-center justify-center shadow-xl`}>
              <span className="text-2xl font-black text-white">{number}</span>
            </div>
            <div className={`w-14 h-14 ${gradient.replace('bg-gradient-to-r', 'bg-gradient-to-r')} rounded-xl flex items-center justify-center shadow-lg`}>
              <span className="text-xl text-white">{icon}</span>
            </div>
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={inView ? { width: '100%' } : {}}
                transition={{ duration: 1.5, delay: delay + 0.3 }}
                className={`h-full ${gradient.replace('bg-gradient-to-r', 'bg-gradient-to-r')} rounded-full`}
              />
            </div>
          </div>

          <h3 className="text-4xl font-black text-slate-800 mb-6">{title}</h3>
          <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl">
            {description}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: delay + 0.5 + index * 0.1 }}
                className="flex items-center gap-3 bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-cyan-200/60 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className={`w-3 h-3 ${gradient.replace('bg-gradient-to-r', 'bg-gradient-to-r')} rounded-full`}></div>
                <span className="text-slate-700 font-semibold">{feature}</span>
              </motion.div>
            ))}
          </div>

          <button className={`${gradient.replace('bg-gradient-to-r', 'bg-gradient-to-r')} hover:shadow-xl text-white px-8 py-4 rounded-xl font-bold shadow-lg whitespace-nowrap flex items-center gap-3 cursor-pointer transition-all duration-300 transform hover:scale-105`}>
            Learn More
            <i className="ri-arrow-right-line text-xl"></i>
          </button>
        </div>

        <div className="flex-1 relative">
          <div className={`absolute -inset-4 ${gradient} rounded-3xl blur-xl opacity-20`}></div>
          <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl p-6 border border-cyan-200/60 shadow-xl overflow-hidden h-[380px] transition-transform duration-300 hover:scale-105">
            <img src={image} alt={alt} className="w-full h-full object-cover rounded-2xl border border-cyan-100" />
            <div className="absolute top-10 right-10 flex gap-2">
              {[1, 2, 3].map((dot, index) => (
                <div
                  key={dot}
                  className={`w-3 h-3 ${gradient.replace('bg-gradient-to-r', 'bg-gradient-to-r')} rounded-full animate-pulse shadow-sm`}
                  style={{ animationDelay: `${index * 0.3}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <Header />
      <HeroSection />

      {/* Features Section */}
      <section id="features" className="py-32 bg-gradient-to-b from-white via-sky-50 to-cyan-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,.1)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 backdrop-blur-xl border border-cyan-300/60 mb-8">
              <motion.div
                className="w-2 h-2 bg-cyan-500 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-slate-700 font-semibold">Revolutionary Features</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-black text-slate-800 mb-8 leading-none">
              <span className="block">Revolutionizing</span>
              <span className="block bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-600 bg-clip-text text-transparent">
                Recruitment
              </span>
            </h2>

            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Experience the next generation of hiring technology with our comprehensive AI-powered recruitment platform designed for{' '}
              <span className="text-blue-600 font-bold">modern organizations</span>.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<i className="ri-brain-line"></i>}
              title="AI-Powered Resume Analysis"
              description="Advanced machine learning algorithms instantly analyze resumes, extracting key skills, experience, and qualifications to match candidates with perfect roles."
              gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
              image="/resume-analysis.jpg"
              alt='Resume Analysis Interface'
              badge="99.7% Accuracy"
              delay={0}
            />

            <FeatureCard
              icon={<i className="ri-user-voice-line"></i>}
              title="Real-Time AI Avatar Interviewer"
              description="Immersive interview experience with lifelike AI avatars that conduct natural conversations, providing human-like interaction and emotional intelligence."
              gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
              image="/ai-avatar.jpg"
              alt="AI Avatar Interviewer"
              badge="95% User Satisfaction"
              delay={0.1}
            />

            <FeatureCard
              icon={<i className="ri-share-forward-line"></i>}
              title="Instant Interview Sharing"
              description="Create interviews in seconds and share via WhatsApp, email, or direct links. Seamless candidate invitation and scheduling system."
              gradient="bg-gradient-to-br from-sky-500 to-cyan-500"
              image="/sharing.jpg"
              alt="Interview Sharing Platform"
              badge="< 30 Seconds Setup"
              delay={0.2}
            />

            <FeatureCard
              icon={<i className="ri-dashboard-line"></i>}
              title="Comprehensive Analytics Dashboard"
              description="Deep insights into candidate performance, interview metrics, and hiring analytics. Make data-driven recruitment decisions with confidence."
              gradient="bg-gradient-to-br from-blue-600 to-slate-600"
              image="/dashboard.jpg"
              alt="Analytics Dashboard"
              badge="50+ Metrics"
              delay={0.3}
            />

            <FeatureCard
              icon={<i className="ri-mic-line"></i>}
              title="Voice Recognition & Analysis"
              description="Advanced speech processing technology that analyzes tone, confidence, and communication skills during real-time interview conversations."
              gradient="bg-gradient-to-br from-cyan-600 to-blue-500"
              image="/voice-recog.jpg"
              alt="Voice Recognition Interface"
              badge="16 Languages"
              delay={0.4}
            />

            <FeatureCard
              icon={<i className="ri-shield-check-line"></i>}
              title="Secure & Compliant"
              description="Enterprise-grade security with GDPR compliance, encrypted data transmission, and secure candidate information management."
              gradient="bg-gradient-to-br from-emerald-500 to-cyan-600"
              image="/secure.jpg"
              alt="Security Dashboard"
              badge="ISO 27001 Certified"
              delay={0.5}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-20"
          >
            <button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-12 py-6 rounded-2xl text-xl font-bold shadow-xl cursor-pointer transition-all duration-300 transform hover:scale-105">
              <span className="flex items-center gap-3 whitespace-nowrap">
                <i className="ri-rocket-line text-xl"></i> Explore All Features
              </span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 bg-gradient-to-b from-cyan-50 via-white to-sky-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,.1)_2px,transparent_2px),linear-gradient(90deg,rgba(6,182,212,.1)_2px,transparent_2px)] bg-[size:80px_80px]"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 backdrop-blur-xl border border-cyan-300/60 mb-8">
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
              <span className="text-slate-700 font-semibold">Simple Process</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-slate-800 mb-8 leading-none">
              How It{' '}
              <span className="block bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-600 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Transform your recruitment process in four simple steps with our intuitive{' '}
              <span className="text-cyan-600 font-bold">AI-powered platform</span>.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-10 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 via-blue-500 to-sky-500 rounded-full hidden lg:block"></div>

            <HowItWorksStep
              number="01"
              icon={<i className="ri-add-circle-line"></i>}
              title="Create Interview"
              description="Set up your interview with custom questions, job requirements, and AI avatar preferences in just minutes using our intuitive interface."
              features={['Custom Questions', 'AI Avatar Selection', 'Job Requirements', 'Time Limits']}
              gradient="bg-gradient-to-r from-cyan-500 to-blue-600"
              image="/create-interview.jpg"
              alt="Create Interview Interface"
              direction="left"
              delay={0}
            />
            <HowItWorksStep
              number="02"
              icon={<i className="ri-share-line"></i>}
              title="Share Interview Link"
              description="Instantly share interview links via WhatsApp, email, or social media. Candidates can access interviews anywhere, anytime with our seamless system."
              features={['WhatsApp Integration', 'Email Automation', 'Social Sharing', 'QR Codes']}
              gradient="bg-gradient-to-r from-emerald-500 to-cyan-500"
              image="/share-link.jpg"
              alt="Interview Sharing Platform"
              direction="right"
              delay={0.2}
            />
            <HowItWorksStep
              number="03"
              icon={<i className="ri-robot-line"></i>}
              title="AI-Powered Interview"
              description="Candidates interact with lifelike AI avatars, upload resumes for instant analysis, and engage in natural conversation with real-time feedback."
              features={['Real-time AI Avatar', 'Resume Analysis', 'Voice Recognition', 'Emotional Intelligence']}
              gradient="bg-gradient-to-r from-blue-500 to-sky-500"
              image="realtime-avatar.jpg"
              alt="AI Interview Session"
              direction="left"
              delay={0.4}
            />
            <HowItWorksStep
              number="04"
              icon={<i className="ri-bar-chart-line"></i>}
              title="Review & Decide"
              description="Access comprehensive analytics, review candidate responses, and make informed hiring decisions with AI-generated insights and recommendations."
              features={['Performance Analytics', 'AI Insights', 'Video Playback', 'Decision Support']}
              gradient="bg-gradient-to-r from-sky-500 to-cyan-500"
              image="/dashboard-analysis.jpg"
              alt="Analytics Review Dashboard"
              direction="right"
              delay={0.6}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mt-20"
          >
            <button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-12 py-6 rounded-2xl text-xl font-bold shadow-xl cursor-pointer transition-all duration-300 transform hover:scale-105">
              <span className="flex items-center gap-4 whitespace-nowrap">
                <i className="ri-play-circle-line text-xl"></i> See It In Action <i className="ri-arrow-right-line text-xl"></i>
              </span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 bg-gradient-to-r from-slate-50 via-white to-cyan-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,.1)_2px,transparent_2px),linear-gradient(90deg,rgba(6,182,212,.1)_2px,transparent_2px)] bg-[size:80px_80px]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 backdrop-blur-xl border border-cyan-300/60 mb-8">
              <motion.div
                className="w-2 h-2 bg-cyan-500 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-slate-700 font-semibold">Real-time Analytics</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-black text-slate-800 mb-8 leading-none">
              <span className="block">Trusted by</span>
              <span className="block bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-600 bg-clip-text text-transparent">
                Industry Leaders
              </span>
            </h2>

            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Join thousands of organizations worldwide who have revolutionized their hiring process with our{' '}
              <span className="text-cyan-600 font-bold">AI-powered platform</span>.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <i className="ri-user-search-line"></i>,
                value: 50000,
                suffix: '+',
                title: 'Interviews Conducted',
                gradient: 'from-cyan-500 to-blue-600',
                description: 'Successful AI-powered interviews completed globally'
              },
              {
                icon: <i className="ri-emotion-happy-line"></i>,
                value: 98,
                suffix: '%',
                title: 'Client Satisfaction',
                gradient: 'from-blue-500 to-cyan-600',
                description: 'Organizations love our recruitment platform'
              },
              {
                icon: <i className="ri-time-line"></i>,
                value: 75,
                suffix: '%',
                title: 'Time Saved',
                gradient: 'from-sky-500 to-cyan-500',
                description: 'Reduction in traditional hiring process time'
              },
              {
                icon: <i className="ri-building-line"></i>,
                value: 500,
                suffix: '+',
                title: 'Companies Trust Us',
                gradient: 'from-emerald-500 to-cyan-600',
                description: 'Global enterprises using our AI recruitment'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-white/90 backdrop-blur-2xl rounded-3xl p-8 border border-cyan-200/60 shadow-xl transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-2xl hover:scale-105 hover:bg-white/95"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-8 transition-opacity duration-300 rounded-3xl`}></div>

                <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center shadow-xl`}>
                  <span className="text-2xl text-white">{stat.icon}</span>
                </div>

                <AnimatedCounter end={stat.value} suffix={stat.suffix} />

                <h3 className="text-slate-700 font-bold text-lg mb-3 text-center">{stat.title}</h3>
                <p className="text-slate-500 text-center text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {stat.description}
                </p>

                <motion.div
                  initial={{ width: '0%' }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-b-3xl"
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-20"
          >
            <button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-12 py-6 rounded-2xl text-xl font-bold shadow-xl cursor-pointer transition-all duration-300 transform hover:scale-105">
              <span className="flex items-center gap-3 whitespace-nowrap">
                <i className="ri-rocket-line text-xl"></i> Explore All Features
              </span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-cyan-500 via-blue-600 to-sky-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,.2)_1px,transparent_1px),linear-gradient(-45deg,rgba(255,255,255,.2)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center bg-white/20 backdrop-blur-2xl py-16 rounded-3xl border border-white/40 shadow-2xl"
          >
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/30 backdrop-blur-xl border border-white/50 mb-8">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-lg text-white font-bold">Limited Time Offer</span>
              <i className="ri-fire-line text-xl text-orange-300"></i>
            </div>

            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-none">
              <span className="block">Ready to Transform</span>
              <div className="block bg-gradient-to-r from-white via-cyan-100 to-sky-100 bg-clip-text text-transparent mb-3 p-4">
                Your Hiring Process?
              </div>
            </h2>

            <p className="text-xl text-white/90 mb-16 max-w-3xl mx-auto leading-relaxed">
              Join the recruitment revolution today. Experience the power of{' '}
              <span className="text-cyan-100 font-bold">AI-driven interviews</span>, real-time avatar interactions, and intelligent candidate assessment in minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-8 justify-center mb-12">
              <a href="/signup">
                <button className="bg-white text-cyan-600 hover:text-blue-700 px-12 py-6 rounded-2xl text-2xl font-black shadow-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-3xl">
                  <span className="flex items-center gap-3 whitespace-nowrap">
                    <i className="ri-rocket-line text-2xl"></i> Start Free Trial
                  </span>
                </button>
              </a>
              <a href="/contact">
                <button className="border-3 border-white text-white hover:bg-white/10 px-12 py-6 rounded-2xl text-2xl font-black backdrop-blur-xl cursor-pointer transition-all duration-300 transform hover:scale-105">
                  <span className="flex items-center gap-3 whitespace-nowrap">
                    <i className="ri-calendar-line text-2xl"></i> Schedule Demo
                  </span>
                </button>
              </a>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-white">
              {[
                {
                  icon: <i className="ri-shield-check-line"></i>,
                  text: 'No Credit Card Required',
                  color: 'border-emerald-300/50'
                },
                {
                  icon: <i className="ri-time-line"></i>,
                  text: 'Setup in 5 Minutes',
                  color: 'border-blue-300/50'
                },
                {
                  icon: <i className="ri-customer-service-2-line"></i>,
                  text: '24/7 Support',
                  color: 'border-cyan-300/50'
                }
              ].map((item, index) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex items-center gap-3 bg-white/20 backdrop-blur-xl rounded-2xl px-6 py-3 border ${item.color}`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-bold text-lg whitespace-nowrap">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="py-16 grid lg:grid-cols-6 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-2"
            >
              <a href="/">
                <div className="flex items-center gap-3 cursor-pointer group">
                  <img src="/logo.png" alt="logo" width={50} height={75} className='rounded-xl' />
                  <span className={`text-3xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-bold ${federant.className}`}>Talk2Hire</span>
                </div>
              </a>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-slate-600 text-lg leading-relaxed mb-8 max-w-md"
              >
                Revolutionizing recruitment with AI-powered interviews, real-time avatars, and intelligent candidate assessment for modern organizations.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-cyan-200/60 shadow-lg"
              >
                <h4 className="text-slate-800 font-bold text-lg mb-4">Stay Updated</h4>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 bg-white/80 border border-cyan-300/60 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300"
                  />
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105">
                    <i className="ri-arrow-right-line"></i>
                  </button>
                </div>
              </motion.div>
            </motion.div>

            {[
              {
                title: 'Product',
                links: ['Features', 'How It Works', 'Pricing', 'Demo']
              },
              {
                title: 'Company',
                links: ['About Us', 'Careers', 'Blog', 'Contact']
              },
              {
                title: 'Support',
                links: ['Help Center', 'Documentation', 'API Reference', 'System Status']
              },
              {
                title: 'Legal',
                links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR']
              }
            ].map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: sectionIndex * 0.1 }}
              >
                <h3 className="text-slate-800 font-bold text-xl mb-6">{section.title}</h3>
                <ul className="space-y-4">
                  {section.links.map((link, linkIndex) => (
                    <motion.li
                      key={link}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.5, delay: sectionIndex * 0.1 + linkIndex * 0.05 }}
                    >
                      <a
                        className="text-slate-600 hover:text-cyan-600 transition-colors duration-300 cursor-pointer block group"
                        href={`/${link.toLowerCase().replace(' ', '-')}`}
                      >
                        <span className="flex items-center gap-2">
                          {link}
                          <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity text-cyan-500">
                            <i className="ri-arrow-right-line"></i>
                          </span>
                        </span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="py-8 border-t border-cyan-300/40 flex flex-col md:flex-row justify-between items-center gap-6"
          >
            <div className="flex items-center gap-6">
              <p className="text-slate-500">© 2025 Talk2Hire. All rights reserved.</p>
              <div className="flex items-center gap-2 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-300/60">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-700 text-sm font-semibold">All Systems Operational</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {[
                {
                  icon: <i className="ri-twitter-x-line text-xl"></i>,
                  color: 'hover:text-blue-400'
                },
                {
                  icon: <i className="ri-linkedin-line text-xl"></i>,
                  color: 'hover:text-blue-600'
                },
                {
                  icon: <i className="ri-github-line text-xl"></i>,
                  color: 'hover:text-emerald-400'
                },
                {
                  icon: <i className="ri-discord-line text-xl"></i>,
                  color: 'hover:text-cyan-400'
                }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href="#"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`w-12 h-12 bg-white/80 backdrop-blur-xl rounded-xl flex items-center justify-center text-slate-500 ${social.color} transition-all duration-300 border border-cyan-200/60 cursor-pointer group hover:shadow-lg transform hover:scale-110`}
                >
                  <span className="text-xl">{social.icon}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full"></div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes pulse-scale {
          0%, 100% { transform: scaleY(1); opacity: 0.5; }
          50% { transform: scaleY(1.5); opacity: 1; }
        }
      `}</style>
    </div>
  )
}