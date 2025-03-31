import { PerspectiveCamera } from "@react-three/drei"
import BackRoom from "./BackRoom"
import { Suspense } from "react"
import CanvasLoader from "./CanvasLoader"
import { Canvas } from "@react-three/fiber"
import { Leva, useControls } from "leva"

const Hero = () => {
    const x = useControls("BackRoom", { 
        positionX: {
            value: 0,
            min: -10,
            max: 10,
        },
        positionY: {
            value: 0,
            min: -10,
            max: 10,
        },
        positionZ: {
            value: 0,
            min: -10,
            max: 10,
        },
        rotationX: {
            value: 0,
            min: -10,
            max: 10,
        },
        rotationY: {
            value: 0,
            min: -10,
            max: 10,
        },
        rotationZ: {
            value: 0,
            min: -10,
            max: 10,
        },
        scaleX: {
            value: 0,
            min: 0.1,
            max: 10,
        },
        scaleY: {
            value: 0,
            min: 0.1,
            max: 10,
        },
        scaleZ: {
            value: 0,
            min: 0.1,
            max: 10,
        }
    });
    
  return (
    <section className="min-h-screen w-full flex flex-col relative">
        <div className="w-full h-138 mx-auto flex flex-col c-space gap-3 z-10 bg-blue-950/50">
            <p className="sm:text-xl text-xl font-medium text-yellow-200 text-center mt-40  w-100 h-10 mx-auto z-10 font-generalsans">
                Hi Welcome To BooxClash!
            </p>
            <p className="text-5xl text-white text-center font-bold z-10 font-generalsans">
            The Ultimate Clash of Knowledge!
            </p>
            <button className="sm:text-2xl text-xl font-medium z-10 text-black mt-8  bg-yellow-200 text-center mx-auto p-2 w-30 rounded font-generalsans">
                PLAY
            </button>
        </div>
        <div className="w-full h-full insert-0 absolute">
            <Leva/>
            <Canvas className="w-full h-full">
                <Suspense fallback ={<CanvasLoader/>}>
                <PerspectiveCamera makeDefault position={[0,0,30]}/>
                <BackRoom 
                // scale={0.05} 
                // position={[0, 0, 0]} 
                // rotation={[0, -Math.PI / 2, 0]} 
                position = {[x.positionX, x.positionY, x.positionZ]}
                rotation = {[x.rotationX, x.rotationY, x.rotationZ]}
                scale = {[x.scaleX, x.scaleY, x.scaleZ]}
                args={[]}
                />
                
                <ambientLight intensity={1}/>
                <directionalLight position={[10,10,10]} intensity={0.5}/>
                </Suspense>
            </Canvas>
        </div>
    </section>
  )
}

export default Hero