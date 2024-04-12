import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

// console.log(typeFaceFont)

/**
 * Base
 */
// Debug
const gui = new GUI()
gui.add(document, 'title')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// INFO: Add axis helper for text centering

// const axesHelper = new THREE.AxesHelper()
// scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/textures/matcaps/10.png')
matcapTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Textures
 */

const fontLoader = new FontLoader() //INFO: careful with FonLoader, been changed

let text, torus; 
let isFontLoaded = false;

fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
        console.log('loaded');
        const textGeometry = new TextGeometry(
            '3D Awesomeness!', 
            {
                font: font, 
                size: 0.5,
                height: 0.2,
                curveSegments: 5,
                bevelEnabled: true,
                bevelThickness: 0.02,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 3
            }
        );

        //     textGeometry.computeBoundingBox();
        //     console.log(textGeometry.boundingBox);
        // //Move the geometry, not the mesh - using translate
        // textGeometry.translate(
        //     -textGeometry.boundingBox.max.x * 0.5, //INFO: in the example, this line has the bevelSize adjustment to center ((-textGeometry.boundingBox.max.x - 0.02) * 0.5), but in my case it's not needed
        //     -textGeometry.boundingBox.max.y * 0.5, //INFO: in the example, this line has the bevelSize adjustment to center ((-textGeometry.boundingBox.max.y - 0.02) * 0.5), but in my case it's not needed
        //     -textGeometry.boundingBox.max.z * 0.5 //INFO: in the example, this line has the bevelThickness adjustment to center ((-textGeometry.boundingBox.max.z - 0.03) * 0.5), but in my case it's not needed
        // ) //looks centered but it's not, due to bevelThickness and bevelSize
        textGeometry.center() //INFO: the easy version of the lines above :)

        // INFO: same material used for text and torus geometries
        const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
        material.matcap = matcapTexture

        // textMaterial.wireframe = true
        text = new THREE.Mesh(textGeometry, material);
        scene.add(text)

        // After repositoning, rotating and scaling objs (lines 86-96), the scene is not optimised (done by time)
        console.time('torus') //console time it started to create the obj and line 105 when it ends

        // INFO: geometry and material moved outside of the for loop to optimise code. It creates one object that it then loops through, rather than the amount in the loop
        const torusGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)

        for(let i = 0; i < 400; i++) {
           
            torus = new THREE.Mesh(torusGeometry, material)

            // Spread objects randomly on the page
            torus.position.x = (Math.random() - 0.5) * 10  //positive and negative equal spread (-0.5), multiplied as many times as needed
            torus.position.y = (Math.random() - 0.5) * 10
            torus.position.z = (Math.random() - 0.5) * 10

            // Rotate 2 axes with enough amplitude is enough
            torus.rotation.x = Math.random() * Math.PI
            torus.rotation.y = Math.random() * Math.PI

            // Change scale
            const scale = Math.random() //do the random once and then use that on each axes instead of doing random per individual axes
            torus.scale.set(scale, scale, scale)

            // Add to scene
            scene.add(torus)
            
        }

        console.timeEnd('torus')
        isFontLoaded = true;
        tick();
    }
    
)

/**
 * Object
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial()
// )

// scene.add(cube)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    if (!isFontLoaded) {
        // Font is not loaded yet, wait for it to load
        return;
    }

    const elapsedTime = clock.getElapsedTime();

    text.rotation.y = 0.15 * elapsedTime;
    text.rotation.x = -0.2 * elapsedTime;
    
    scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.geometry instanceof THREE.TorusGeometry) {
            const rotateX = 0.01;
            const rotateY = 0.01;
            object.rotation.y += Math.random() * rotateX;
            object.rotation.x += Math.random() * rotateY;
        }
    });

    // INFO:FIXME: This code makes the objects tremble - really cool if needed for a feature
    // scene.traverse((object) => {
    //     if (object instanceof THREE.Mesh && object.geometry instanceof THREE.TorusGeometry) {
    //         const rotateX = 0.02 * elapsedTime;
    //         const rotateY = 0.01 * elapsedTime;
    //         object.rotation.y = Math.random() * rotateX;
    //         object.rotation.x = Math.random() * rotateY;
    //     }
    // });
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()