import { useGLTF } from '@react-three/drei'

const BackRoom = (props: any) => {
  const { nodes, materials } = useGLTF('/models/backroom.glb') as unknown as { nodes: any; materials: any };
  return (
    <group {...props} dispose={null}>
      <group scale={0.01}>
        <group
          position={[0, 122.55627, -99.56375]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[237.37819, 243.1062, 10.54363]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.stage_stage5_0.geometry}
            material={materials.stage5}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.stage_stage2_0.geometry}
            material={materials.stage2}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.stage_stage3_0.geometry}
            material={materials.stage3}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.stage_stage1_0.geometry}
            material={materials.stage1}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.stage_stage4_0.geometry}
            material={materials.stage4}
          />
        </group>
        <group
          position={[0, 600.50995, -301.16669]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[976.00415, 3.16127, 443.10141]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.frame_frame1_0.geometry}
            material={materials.frame1}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.frame_frame2_0.geometry}
            material={materials.frame2}
          />
        </group>
        <group
          position={[-1435.45264, 946.57489, -215.33444]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[22.00794, 574.78918, 100]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.dec_dec1_0.geometry}
            material={materials.dec1}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.dec_dec2_0.geometry}
            material={materials.dec2}
          />
        </group>
        <group
          position={[-1823.35266, 355.14987, -855.58746]}
          rotation={[-1.23149, 0.3999, 0.83436]}
          scale={[418.33075, 113.48807, 325.78165]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube_dec_cube_dec1_0.geometry}
            material={materials.cube_dec1}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube_dec_cude_dec2_0.geometry}
            material={materials.cude_dec2}
          />
        </group>
        <group
          position={[-1773.13635, 316.91269, 458.87762]}
          rotation={[Math.PI, 0.19323, 0.71674]}
          scale={[359.58154, 97.5501, 280.02975]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube_light_Cube_light2_0.geometry}
            material={materials.Cube_light2}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube_light_Cube_light3_0.geometry}
            material={materials.Cube_light3}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube_light_Cube_light4_0.geometry}
            material={materials.Cube_light4}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube_light_Cube_light1_0.geometry}
            material={materials.Cube_light1}
          />
        </group>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.house_house_0.geometry}
          material={materials.house}
          position={[45.13353, 340.94965, 0.00004]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[4456.01611, 4456.01611, 341.147]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.lighting_lighting_0.geometry}
          material={materials.lighting}
          position={[-0.00001, 52.1588, 115.18826]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[726.45471, 691.25293, 22.13799]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.screen_screen001_0.geometry}
          material={materials['screen.001']}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.roof_roof2_0.geometry}
          material={materials.roof2}
          position={[0, 1336.28906, -67.29418]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[1205.93286, 1148.8501, 58.48835]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.floor_floor_0.geometry}
          material={materials.floor}
          position={[45.13353, 340.94965, 0.00004]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[4456.01611, 4456.01611, 341.147]}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/models/backroom.glb')

export default BackRoom;