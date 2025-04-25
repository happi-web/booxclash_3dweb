declare module "vanta/dist/vanta.waves.min" {
    import * as THREE from "three";
  
    interface VantaBaseOptions {
      el: HTMLElement | null;
      THREE: typeof THREE;
      mouseControls?: boolean;
      touchControls?: boolean;
      gyroControls?: boolean;
      minHeight?: number;
      minWidth?: number;
    }
  
    interface VantaWavesOptions extends VantaBaseOptions {
      color?: number;
      shininess?: number;
      waveHeight?: number;
      waveSpeed?: number;
      zoom?: number;
    }
  
    export default function WAVES(options: VantaWavesOptions): {
      destroy: () => void;
    };
  }
  