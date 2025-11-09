import React, { useCallback } from 'react';
import Particles from "react-tsparticles";
import type { Container, Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";

const AnimatedBackground: React.FC = () => {

    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    const particlesLoaded = useCallback(async (container: Container | undefined) => {
        // You can add logic here if needed once the container is loaded
    }, []);
    
    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Animated Gradient Mesh */}
            <div className="absolute inset-0 z-1" style={{ mixBlendMode: 'hard-light' }}>
                <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-primary-glow rounded-full opacity-20 animate-[spin_20s_linear_infinite]" style={{ filter: 'blur(100px)' }}/>
                <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-accent-glow rounded-full opacity-20 animate-[spin_25s_linear_infinite_reverse]" style={{ filter: 'blur(100px)' }}/>
            </div>

            {/* Floating Particles */}
            <Particles
                id="tsparticles"
                init={particlesInit}
                loaded={particlesLoaded}
                options={{
                    fullScreen: { enable: false },
                    background: {
                        color: {
                            value: "transparent",
                        },
                    },
                    fpsLimit: 60,
                    interactivity: {
                        events: {
                            onHover: {
                                enable: false,
                            },
                            onClick: {
                                enable: false,
                            },
                        },
                    },
                    particles: {
                        color: {
                            value: "#00FFF5",
                        },
                        links: {
                            enable: false,
                        },
                        move: {
                            direction: "top",
                            enable: true,
                            outModes: {
                                default: "out",
                            },
                            random: true,
                            speed: 0.5,
                            straight: false,
                        },
                        number: {
                            density: {
                                enable: true,
                            },
                            value: 50,
                        },
                        opacity: {
                            value: { min: 0.1, max: 0.5 },
                            animation: {
                                enable: true,
                                speed: 1,
                                sync: false
                            }
                        },
                        shape: {
                            type: "circle",
                        },
                        size: {
                            value: { min: 1, max: 3 },
                        },
                    },
                    detectRetina: true,
                }}
                className="absolute inset-0 z-2"
            />
        </div>
    );
};

export default React.memo(AnimatedBackground);
