import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { Chess, Square } from 'chess.js';
import { pieceNames } from './rules';

type Props = { chess: Chess; selected?: Square | null; legal?: Square[]; onSquare?: (s: Square) => void; flipped?: boolean; night?: boolean; decorative?: boolean; lastMove?: {from:Square;to:Square} };
const coord = (s: string) => new THREE.Vector3(s.charCodeAt(0)-100.5, .12, 4.5-Number(s[1]));
function piece(type: string, color: string): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshPhysicalMaterial({color: color === 'w' ? '#f4ead2' : '#244a3d', metalness: color === 'w' ? .12 : .35, roughness:.24, clearcoat:.5 });
  const profile: Record<string, number[][]> = {
    p:[[.0,0],[.29,0],[.34,.08],[.31,.15],[.22,.2],[.15,.28],[.12,.48],[.2,.56],[.22,.6]],
    r:[[0,0],[.34,0],[.38,.1],[.32,.2],[.23,.25],[.21,.65],[.3,.72],[.33,.85],[.33,1.0]],
    n:[[0,0],[.34,0],[.38,.1],[.3,.2],[.21,.3],[.23,.48],[.27,.52]],
    b:[[0,0],[.34,0],[.38,.1],[.3,.2],[.2,.3],[.12,.65],[.24,.72],[.25,.77],[.14,.82]],
    q:[[0,0],[.37,0],[.4,.1],[.31,.21],[.2,.3],[.14,.73],[.25,.83],[.27,.9],[.23,.95],[.3,1.15]],
    k:[[0,0],[.38,0],[.4,.1],[.32,.2],[.2,.35],[.15,.76],[.27,.86],[.28,.94],[.22,1.05]]
  };
  const add = (geometry: THREE.BufferGeometry, y: number, x=0,z=0) => {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; group.add(mesh); return mesh;
  };
  add(new THREE.LatheGeometry(profile[type].map(p=>new THREE.Vector2(p[0],p[1])),32),0);
  if(type==='p') add(new THREE.SphereGeometry(.225,24,16),.76);
  if(type==='b') {
    const head = add(new THREE.SphereGeometry(.2,24,16),1.03); head.scale.set(.8,1.4,.8);
    add(new THREE.SphereGeometry(.065,16,12),1.32);
    const slash = new THREE.Mesh(new THREE.BoxGeometry(.03,.23,.36),new THREE.MeshStandardMaterial({color:color==='w'?'#a9946c':'#112b24'})); slash.position.set(0,1.09,0); slash.rotation.z=-.38; group.add(slash);
  }
  if(type==='r') for(let i=0;i<6;i++) { const a=i*Math.PI/3; add(new THREE.BoxGeometry(.15,.2,.16),1.06,Math.cos(a)*.25,Math.sin(a)*.25); }
  if(type==='q') { for(let i=0;i<8;i++){const a=i*Math.PI/4; add(new THREE.SphereGeometry(.06,12,8),1.22,Math.cos(a)*.26,Math.sin(a)*.26);} add(new THREE.SphereGeometry(.105,20,12),1.3); }
  if(type==='k') {add(new THREE.BoxGeometry(.1,.37,.1),1.28); add(new THREE.BoxGeometry(.3,.09,.1),1.3); }
  if(type==='n') {
    const shape = new THREE.Shape(); shape.moveTo(-.22,0); shape.lineTo(.23,0); shape.lineTo(.17,.45); shape.lineTo(.32,.68); shape.lineTo(.3,.9); shape.lineTo(.15,.85); shape.lineTo(-.08,.92); shape.lineTo(-.22,.73); shape.lineTo(-.35,.62); shape.lineTo(-.38,.42); shape.lineTo(-.15,.38); shape.lineTo(-.04,.52); shape.lineTo(-.15,.23); shape.closePath();
    const head=add(new THREE.ExtrudeGeometry(shape,{depth:.2,bevelEnabled:true,bevelSize:.04,bevelThickness:.04,bevelSegments:3,steps:1}),.5,0,-.1);
    head.rotation.y=color==='w'?Math.PI/2:-Math.PI/2;
  }
  return group;
}
export default function Board3D(props: Props) {
  const mount = useRef<HTMLDivElement>(null), current = useRef(props), update = useRef<() => void>(()=>{});
  const [failed,setFailed]=useState(false);
  current.current=props;
  useEffect(()=>{update.current();});
  useEffect(()=>{
    const host=mount.current; if(!host) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'}); }
    catch {setFailed(true);return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.25; host.appendChild(renderer.domElement);
    const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(36,1,.1,100);
    const pmrem = new THREE.PMREMGenerator(renderer), room = new RoomEnvironment(), env=pmrem.fromScene(room);
    scene.environment=env.texture; room.dispose(); pmrem.dispose();
    const ambient = new THREE.HemisphereLight(0xfff5dd,0x325b50,2.1); scene.add(ambient);
    const light = new THREE.DirectionalLight(0xfff0cf,5); light.position.set(-4,12,6); light.castShadow=true; light.shadow.mapSize.set(2048,2048); light.shadow.camera.left=-8; light.shadow.camera.right=8; light.shadow.camera.top=8; light.shadow.camera.bottom=-8; light.shadow.normalBias=.025; scene.add(light);
    const fill = new THREE.DirectionalLight(0xb2d2ff,2); fill.position.set(6,5,-6); scene.add(fill);
    const board = new THREE.Group(); scene.add(board);
    const baseMaterial=new THREE.MeshStandardMaterial({color:0x3c5144,roughness:.35,metalness:.2});
    const base=new THREE.Mesh(new THREE.BoxGeometry(8.7,.38,8.7),baseMaterial); base.position.y=-.13; base.castShadow=true; base.receiveShadow=true; board.add(base);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(8.77,.07,8.77),new THREE.MeshStandardMaterial({color:0xb29563,metalness:.6,roughness:.3})); trim.position.y=-.23; board.add(trim);
    const tiles: THREE.Mesh[]=[];
    for(let rank=1;rank<=8;rank++)for(let file=0;file<8;file++){
      const sq=String.fromCharCode(97+file)+rank;
      const tile = new THREE.Mesh(new THREE.BoxGeometry(.995,.09,.995),new THREE.MeshStandardMaterial({color:(file+rank)%2===1?0x577467:0xe7ddc4,roughness:.38,metalness:.08}));
      tile.position.copy(coord(sq)); tile.position.y=.09; tile.userData.square=sq; tile.receiveShadow=true; board.add(tile); tiles.push(tile);
    }
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.17})); ground.rotation.x=-Math.PI/2;ground.position.y=-.34;ground.receiveShadow=true;scene.add(ground);
    const pieces = new THREE.Group(),markers=new THREE.Group();scene.add(pieces,markers);
    let oldFen='',oldMark='',oldNight:boolean|undefined,oldFlip:boolean|undefined;
    update.current=()=>{
      const p=current.current;
      if(p.night!==oldNight){oldNight=p.night;light.intensity=p.night?3.4:5;ambient.intensity=p.night?1.6:2.1;}
      if(Boolean(p.flipped)!==oldFlip){oldFlip=Boolean(p.flipped);camera.position.set(p.flipped?-9:9,12.5,p.flipped?-12:12);camera.lookAt(0,.15,0);}
      const fen=p.chess.fen().split(' ')[0];
      if(fen!==oldFen){
        oldFen=fen;
        while(pieces.children.length){const child=pieces.children[0];pieces.remove(child);child.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(o.material as THREE.Material).dispose();}});}
        p.chess.board().flat().forEach(pce=>{if(!pce)return;const model=piece(pce.type,pce.color);model.position.copy(coord(pce.square));model.userData.target=model.position.clone();if(p.lastMove?.to===pce.square){model.position.copy(coord(p.lastMove.from));}model.traverse(o=>{o.userData.square=pce.square;});pieces.add(model);});
      }
      const mark=JSON.stringify([p.selected,p.legal,p.lastMove,p.chess.isCheck()]);
      if(mark!==oldMark){
        oldMark=mark;while(markers.children.length){const child=markers.children[0] as THREE.Mesh;markers.remove(child);child.geometry.dispose();(child.material as THREE.Material).dispose();}
        tiles.forEach(tile=>{
          const sq=tile.userData.square as Square, index=sq.charCodeAt(0)-97+Number(sq[1]);
          let color=index%2===1?0x577467:0xe7ddc4;
          if(p.lastMove&&(sq===p.lastMove.from||sq===p.lastMove.to)) color=index%2===1?0x8d9760:0xd2c58c;
          if(p.selected===sq) color=0xcbaf66;
          const pc=p.chess.get(sq);if(pc?.type==='k'&&pc.color===p.chess.turn()&&p.chess.isCheck())color=0xb8584d;
          (tile.material as THREE.MeshStandardMaterial).color.setHex(color);
        });
        p.legal?.forEach(sq=>{const dot=new THREE.Mesh(new THREE.RingGeometry(p.chess.get(sq)? .36:.085,p.chess.get(sq)? .42:.15,32),new THREE.MeshBasicMaterial({color:0x244e3f,transparent:true,opacity:.65,side:THREE.DoubleSide}));dot.rotation.x=-Math.PI/2;dot.position.copy(coord(sq));dot.position.y=.15;markers.add(dot);});
      }
    };
    update.current();
    const resize=()=>{const {width,height}=host.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/Math.max(height,1);camera.updateProjectionMatrix();};
    const observer=new ResizeObserver(resize);observer.observe(host);resize();
    const raycaster=new THREE.Raycaster();
    const click=(event:PointerEvent)=>{
      if(!current.current.onSquare)return;
      const bounds=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1),camera);
      const hit=raycaster.intersectObjects([...pieces.children,...tiles],true).find(h=>h.object.userData.square);
      if(hit)current.current.onSquare(hit.object.userData.square);
    };
    renderer.domElement.addEventListener('pointerup',click);
    renderer.setAnimationLoop(()=>{pieces.children.forEach(p=>{const target=p.userData.target as THREE.Vector3;p.position.lerp(target,.16);});renderer.render(scene,camera);});
    return()=>{update.current=()=>{};observer.disconnect();renderer.setAnimationLoop(null);renderer.domElement.removeEventListener('pointerup',click);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});env.dispose();renderer.dispose();renderer.domElement.remove();};
  },[]);
  return <div className={'board3d '+(props.decorative?'decorative':'')} ref={mount} role="img" aria-label="Tablero de ajedrez tridimensional">
    {failed&&<div className="canvas-fallback">La vista 3D no está disponible. Selecciona la vista 2D para jugar.</div>}
    {!props.decorative&&<div className="sr-only" aria-label="Casillas del tablero">{props.chess.board().flat().map((p,i)=>{const sq=(String.fromCharCode(97+i%8)+(8-Math.floor(i/8))) as Square;return <button key={sq} onClick={()=>props.onSquare?.(sq)}>{sq}{p?' '+pieceNames[p.type]+' '+(p.color==='w'?'blanco':'negro'):''}</button>;})}</div>}
  </div>;
}



