import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

// This is a re-implementation of the AIAvatar using the standard three.js library
// to fix the module not found error.

export default function AIAvatar({
  emotion = 'neutral',
  isListening = false,
  isSpeaking = false,
  interviewerName = "Alexandra",
  className = ""
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({ emotion, isListening, isSpeaking });

  // Update state ref without causing re-renders
  useEffect(() => {
    stateRef.current = { emotion, isListening, isSpeaking };
  }, [emotion, isListening, isSpeaking]);

  const getEmotionStyle = useCallback((emotion) => {
    switch (emotion) {
      case 'encouraging': return { bodyColor: '#2563eb', eyeScale: 1.2 };
      case 'thoughtful': return { bodyColor: '#7c3aed', eyeScale: 0.9 };
      case 'impressed': return { bodyColor: '#059669', eyeScale: 1.3 };
      case 'concerned': return { bodyColor: '#dc2626', eyeScale: 0.8 };
      default: return { bodyColor: '#1e40af', eyeScale: 1.0 };
    }
  }, []);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);
    const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xcccccc, 0.8));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Avatar Group
    const avatarGroup = new THREE.Group();
    avatarGroup.position.y = -0.5;
    scene.add(avatarGroup);

    // Materials
    const headMaterial = new THREE.MeshStandardMaterial({ color: '#fdbcb4' });
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: '#000000' });
    const mouthMaterial = new THREE.MeshStandardMaterial({ color: '#ff6b6b' });
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: getEmotionStyle('neutral').bodyColor });
    const shirtMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff' });
    const tieMaterial = new THREE.MeshStandardMaterial({ color: '#1a2f4b' });

    // Geometries
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), headMaterial);
    head.position.y = 1.5;
    avatarGroup.add(head);

    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), eyeMaterial);
    leftEye.position.set(-0.25, 1.6, 0.65);
    avatarGroup.add(leftEye);

    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), eyeMaterial);
    rightEye.position.set(0.25, 1.6, 0.65);
    avatarGroup.add(rightEye);

    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.1), mouthMaterial);
    mouth.position.set(0, 1.3, 0.65);
    avatarGroup.add(mouth);

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.6), bodyMaterial);
    avatarGroup.add(body);
    
    const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.0, 0.1), shirtMaterial);
    shirt.position.set(0, 0.4, 0.31);
    body.add(shirt);

    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.8, 0.1), tieMaterial);
    tie.position.set(0, 0.2, 0.36);
    body.add(tie);

    // Animation loop
    const clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const { emotion, isListening, isSpeaking } = stateRef.current;
      const elapsedTime = clock.getElapsedTime();

      // Update materials and scales based on emotion
      const { bodyColor, eyeScale } = getEmotionStyle(emotion);
      body.material.color.set(bodyColor);
      leftEye.scale.y = eyeScale;
      rightEye.scale.y = eyeScale;

      // Animations
      avatarGroup.position.y = -0.5 + Math.sin(elapsedTime * 0.5) * 0.02; // Breathing
      if (isListening) {
        avatarGroup.rotation.y = Math.sin(elapsedTime * 0.4) * 0.05;
      } else {
        avatarGroup.rotation.y *= 0.95; // Smoothly return to center
      }
      
      if (isSpeaking) {
        mouth.scale.y = 1 + Math.sin(elapsedTime * 12) * 0.5;
        mouth.position.y = 1.3 - (mouth.scale.y-1) * 0.025;
      } else {
        mouth.scale.y = 1;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
        if (!currentMount) return;
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if(currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      cancelAnimationFrame(animationFrameId);
      // Dispose of Three.js objects to free up memory
      scene.traverse(object => {
        if (object.isMesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
    };
  }, [getEmotionStyle]); // Only re-run if getEmotionStyle changes (which it won't due to useCallback)

  return (
    <div className={`relative w-full h-96 rounded-xl overflow-hidden shadow-lg bg-slate-100 ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-red-400 animate-pulse' : isListening ? 'bg-green-400' : 'bg-yellow-400'}`} />
          <span className="font-medium">{interviewerName}</span>
        </div>
      </div>
    </div>
  );
}