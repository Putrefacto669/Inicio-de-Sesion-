// ============================================
// CONFIGURACIÓN CENTRALIZADA
// ============================================
const CONFIG = {
  eyeMaxHorizD: 20,
  eyeMaxVertD: 10,
  noseMaxHorizD: 23,
  noseMaxVertD: 10,
  animationDuration: 1,
  animationEase: "Power2.easeOut",
  blinkInterval: { min: 2000, max: 5000 },
  cursorTracking: { sensitivity: 0.03, inertia: 0.3 },
  validation: {
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    minPasswordLength: 6
  }
};

// ============================================
// ELEMENTOS DEL DOM
// ============================================
const DOM = {
  // Formulario y campos
  email: document.querySelector('#email'),
  password: document.querySelector('#password'),
  form: document.querySelector('form'),
  loginBtn: document.querySelector('#login'),
  inputGroups: document.querySelectorAll('.inputGroup'),
  
  // Avatar SVG
  mySVG: document.querySelector('.svgContainer'),
  armL: document.querySelector('.armL'),
  armR: document.querySelector('.armR'),
  eyeL: document.querySelector('.eyeL'),
  eyeR: document.querySelector('.eyeR'),
  nose: document.querySelector('.nose'),
  mouth: document.querySelector('.mouth'),
  mouthBG: document.querySelector('.mouthBG'),
  mouthSmallBG: document.querySelector('.mouthSmallBG'),
  mouthMediumBG: document.querySelector('.mouthMediumBG'),
  mouthLargeBG: document.querySelector('.mouthLargeBG'),
  mouthMaskPath: document.querySelector('#mouthMaskPath'),
  mouthOutline: document.querySelector('.mouthOutline'),
  tooth: document.querySelector('.tooth'),
  tongue: document.querySelector('.tongue'),
  chin: document.querySelector('.chin'),
  face: document.querySelector('.face'),
  eyebrow: document.querySelector('.eyebrow'),
  outerEarL: document.querySelector('.earL .outerEar'),
  outerEarR: document.querySelector('.earR .outerEar'),
  earHairL: document.querySelector('.earL .earHair'),
  earHairR: document.querySelector('.earR .earHair'),
  hair: document.querySelector('.hair')
};

// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================
const state = {
  mouthStatus: "small",
  isPasswordFocused: false,
  isEmailFocused: false,
  lastBlinkTime: 0,
  mouseX: 0,
  mouseY: 0,
  targetEyeX: 0,
  targetEyeY: 0,
  currentEyeX: 0,
  currentEyeY: 0,
  formState: 'neutral',
  backspaceCount: 0,
  backspaceTimer: null,
  blinkTimeout: null,
  cursorTrackingRAF: null,
  isInitialized: false,
  isPasswordVisible: false,
  isCoveringEyes: false,
  passwordToggleBtn: null
};

// ============================================
// 1. SISTEMA DE PARPADEO NATURAL
// ============================================
function setupNaturalBlinking() {
  console.log('✅ Sistema de parpadeo natural activado');
  
  function performBlink() {
    if (state.isCoveringEyes) return; // No parpadear si los ojos están cubiertos
    
    const blinkType = Math.random() > 0.8 ? 'double' : 'single';
    
    if (blinkType === 'single') {
      // Parpadeo simple natural
      TweenMax.to([DOM.eyeL, DOM.eyeR], 0.12, {
        scaleY: 0.05,
        transformOrigin: "center center",
        yoyo: true,
        repeat: 1,
        ease: "Power1.easeInOut",
        onComplete: () => {
          TweenMax.to([DOM.eyeL, DOM.eyeR], 0.08, {
            scaleY: 1,
            ease: "Power1.easeOut"
          });
        }
      });
    } else {
      // Parpadeo doble (más expresivo)
      TweenMax.to([DOM.eyeL, DOM.eyeR], 0.1, {
        scaleY: 0.05,
        transformOrigin: "center center",
        yoyo: true,
        repeat: 1,
        ease: "Power1.easeInOut",
        onComplete: () => {
          setTimeout(() => {
            TweenMax.to([DOM.eyeL, DOM.eyeR], 0.08, {
              scaleY: 0.05,
              transformOrigin: "center center",
              yoyo: true,
              repeat: 1,
              ease: "Power1.easeInOut",
              onComplete: () => {
                TweenMax.to([DOM.eyeL, DOM.eyeR], 0.06, {
                  scaleY: 1,
                  ease: "Power1.easeOut"
                });
              }
            });
          }, 120);
        }
      });
    }
    
    state.lastBlinkTime = Date.now();
  }
  
  function scheduleBlink() {
    if (state.blinkTimeout) clearTimeout(state.blinkTimeout);
    
    const delay = CONFIG.blinkInterval.min + 
                  Math.random() * (CONFIG.blinkInterval.max - CONFIG.blinkInterval.min);
    
    state.blinkTimeout = setTimeout(() => {
      performBlink();
      scheduleBlink();
    }, delay);
  }
  
  function setupReflexBlinking() {
    // Parpadeo reflejo al enfocar campos
    DOM.email.addEventListener('focus', () => {
      setTimeout(() => {
        if (!state.isCoveringEyes) performBlink();
      }, 400);
    });
    
    DOM.password.addEventListener('focus', () => {
      setTimeout(() => {
        if (!state.isCoveringEyes) performBlink();
      }, 400);
    });
    
    // Parpadeo al hacer clic en el formulario
    DOM.form.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT' && e.target !== state.passwordToggleBtn) {
        setTimeout(() => performBlink(), 200);
      }
    });
  }
  
  scheduleBlink();
  setupReflexBlinking();
  
  // Parpadeo inicial
  setTimeout(() => performBlink(), 1000);
}

// ============================================
// 2. REACCIONES A BACKSPACE/ENTER
// ============================================
function setupKeyboardReactions() {
  console.log('✅ Sistema de reacciones a teclado activado');
  
  document.addEventListener('keydown', (e) => {
    // Solo reaccionar si el email tiene foco
    if (document.activeElement !== DOM.email) return;
    
    switch(e.key) {
      case 'Backspace':
        e.preventDefault(); // Prevenir comportamiento por defecto
        handleBackspace();
        DOM.email.value = DOM.email.value.slice(0, -1); // Eliminar último carácter manualmente
        DOM.email.dispatchEvent(new Event('input')); // Disparar evento input
        break;
        
      case 'Enter':
        if (!e.ctrlKey && !e.metaKey) { // No reaccionar a Ctrl+Enter
          e.preventDefault();
          handleEnter();
        }
        break;
        
      case 'Tab':
        handleTab(e);
        break;
    }
  });
  
  function handleBackspace() {
    state.backspaceCount++;
    
    // Limpiar timer anterior
    if (state.backspaceTimer) clearTimeout(state.backspaceTimer);
    state.backspaceTimer = setTimeout(() => {
      state.backspaceCount = 0;
    }, 1000);
    
    // Expresión basada en el número de backspaces
    if (state.backspaceCount === 1) {
      // Primer backspace - sorpresa leve
      showTemporaryExpression('surprised', 300);
      TweenMax.to(DOM.nose, 0.15, {
        y: -3,
        yoyo: true,
        repeat: 1,
        ease: "Power1.easeInOut"
      });
      
    } else if (state.backspaceCount === 2 || state.backspaceCount === 3) {
      // Segundo o tercer backspace - confusión
      showTemporaryExpression('confused', 400);
      TweenMax.to(DOM.mySVG, 0.2, {
        rotation: 3,
        yoyo: true,
        repeat: 1,
        ease: "Power1.easeInOut",
        transformOrigin: "center bottom"
      });
      
    } else if (state.backspaceCount >= 4) {
      // Muchos backspaces - frustración
      showTemporaryExpression('frustrated', 600);
      
      // Sacudida más pronunciada
      TweenMax.to(DOM.mySVG, 0.1, {
        x: 5,
        yoyo: true,
        repeat: 3,
        ease: "Power1.easeInOut"
      });
      
      // Cejas fruncidas
      TweenMax.to(DOM.eyebrow, 0.2, {
        y: 4,
        skewX: -12,
        ease: "Power2.easeOut"
      });
    }
  }
  
  function handleEnter() {
    // Reacción a Enter (anticipación)
    showTemporaryExpression('anticipation', 500);
    
    // Movimiento de cabeza hacia arriba
    TweenMax.to(DOM.mySVG, 0.25, {
      y: -8,
      yoyo: true,
      repeat: 1,
      ease: "Power2.easeInOut"
    });
    
    // Ojos más abiertos
    TweenMax.to([DOM.eyeL, DOM.eyeR], 0.15, {
      scaleY: 1.15,
      scaleX: 0.92,
      yoyo: true,
      repeat: 1,
      ease: "Power1.easeInOut"
    });
    
    // Boca ligeramente abierta
    TweenMax.to(DOM.mouth, 0.15, {
      y: -3,
      ease: "Power1.easeOut"
    });
  }
  
  function handleTab(e) {
    // Reacción al cambiar campo con Tab
    showTemporaryExpression('looking', 250);
    
    // Movimiento ocular rápido en la dirección del cambio
    const direction = e.shiftKey ? 1 : -1; // Shift+Tab va hacia atrás
    TweenMax.to([DOM.eyeL, DOM.eyeR], 0.12, {
      x: direction * 10,
      yoyo: true,
      repeat: 1,
      ease: "Power1.easeInOut"
    });
    
    // Inclinación de cabeza sutil
    TweenMax.to(DOM.mySVG, 0.2, {
      rotation: direction * 5,
      yoyo: true,
      repeat: 1,
      ease: "Power1.easeInOut",
      transformOrigin: "center bottom"
    });
  }
  
  function showTemporaryExpression(type, duration) {
    // Cancelar animaciones en curso de elementos faciales
    TweenMax.killTweensOf([DOM.eyeL, DOM.eyeR, DOM.mouth, DOM.eyebrow, DOM.nose]);
    
    switch(type) {
      case 'surprised':
        TweenMax.to([DOM.eyeL, DOM.eyeR], 0.1, {
          scaleY: 1.25,
          scaleX: 0.85,
          ease: "Power1.easeOut"
        });
        break;
        
      case 'confused':
        TweenMax.to(DOM.eyebrow, 0.1, {
          y: 3,
          skewX: 8,
          ease: "Power1.easeOut"
        });
        TweenMax.to([DOM.eyeL, DOM.eyeR], 0.1, {
          scaleY: 0.85,
          ease: "Power1.easeOut"
        });
        break;
        
      case 'frustrated':
        TweenMax.to(DOM.eyebrow, 0.1, {
          y: 5,
          skewX: -15,
          ease: "Power1.easeOut"
        });
        TweenMax.to(DOM.mouth, 0.1, {
          y: 3,
          ease: "Power1.easeOut"
        });
        TweenMax.to([DOM.eyeL, DOM.eyeR], 0.1, {
          scaleY: 0.8,
          scaleX: 1.1,
          ease: "Power1.easeOut"
        });
        break;
        
      case 'anticipation':
        TweenMax.to([DOM.eyeL, DOM.eyeR], 0.1, {
          scaleY: 1.2,
          scaleX: 0.9,
          ease: "Power1.easeOut"
        });
        TweenMax.to(DOM.mouth, 0.1, {
          y: -2,
          ease: "Power1.easeOut"
        });
        TweenMax.to(DOM.eyebrow, 0.1, {
          y: -2,
          ease: "Power1.easeOut"
        });
        break;
        
      case 'looking':
        TweenMax.to([DOM.eyeL, DOM.eyeR], 0.1, {
          scaleX: 0.8,
          ease: "Power1.easeOut"
        });
        break;
    }
    
    // Volver a la expresión neutral después del tiempo especificado
    setTimeout(() => {
      resetFacialExpression();
    }, duration);
  }
  
  function resetFacialExpression() {
    TweenMax.to([DOM.eyeL, DOM.eyeR, DOM.mouth, DOM.eyebrow, DOM.nose], 0.4, {
      scaleX: 1,
      scaleY: 1,
      x: 0,
      y: 0,
      skewX: 0,
      rotation: 0,
      ease: "Power2.easeOut"
    });
  }
}

// ============================================
// 3. SEGUIMIENTO DE CURSOR MEJORADO
// ============================================
function setupAdvancedCursorTracking() {
  console.log('✅ Sistema de seguimiento de cursor activado');
  
  function updateEyePosition() {
    // Aplicar inercia al movimiento ocular
    state.currentEyeX += (state.targetEyeX - state.currentEyeX) * CONFIG.cursorTracking.inertia;
    state.currentEyeY += (state.targetEyeY - state.currentEyeY) * CONFIG.cursorTracking.inertia;
    
    // Aplicar movimiento suavizado a los ojos
    TweenMax.set([DOM.eyeL, DOM.eyeR], {
      x: state.currentEyeX,
      y: state.currentEyeY
    });
    
    // Movimiento sutil de cabeza (seguimiento natural)
    const headTilt = state.currentEyeX * 0.08;
    const headNod = state.currentEyeY * 0.05;
    
    TweenMax.to(DOM.mySVG, 0.6, {
      rotation: headTilt,
      y: headNod,
      transformOrigin: "center bottom",
      ease: "Power1.easeOut"
    });
    
    // Movimiento de cejas según la dirección vertical
    const eyebrowMove = state.currentEyeY * 0.15;
    TweenMax.to(DOM.eyebrow, 0.4, {
      y: eyebrowMove,
      ease: "Power1.easeOut"
    });
    
    // Continuar la animación
    state.cursorTrackingRAF = requestAnimationFrame(updateEyePosition);
  }
  
  function handleMouseMove(e) {
    // No seguir cursor si el email está enfocado (ya tiene su propio seguimiento)
    if (state.isEmailFocused) return;
    
    const svgRect = DOM.mySVG.getBoundingClientRect();
    const svgCenterX = svgRect.left + svgRect.width / 2;
    const svgCenterY = svgRect.top + svgRect.height / 2;
    
    // Calcular distancia desde el centro del avatar
    const dx = e.clientX - svgCenterX;
    const dy = e.clientY - svgCenterY;
    
    // Distancia normalizada (0 a 1)
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 400; // Radio máximo de seguimiento
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    
    // Los ojos siguen más cuando el cursor está cerca, menos cuando está lejos
    const intensity = 1.2 - normalizedDistance * 0.7;
    
    // Calcular posición objetivo con intensidad variable
    state.targetEyeX = Math.max(Math.min(
      dx * CONFIG.cursorTracking.sensitivity * intensity, 
      CONFIG.eyeMaxHorizD
    ), -CONFIG.eyeMaxHorizD);
    
    state.targetEyeY = Math.max(Math.min(
      dy * CONFIG.cursorTracking.sensitivity * intensity * 0.8, 
      CONFIG.eyeMaxVertD
    ), -CONFIG.eyeMaxVertD);
    
    // Efecto sutil en el cabello
    const hairMove = dx * 0.003;
    TweenMax.to(DOM.hair, 0.3, {
      x: hairMove,
      ease: "Power1.easeOut"
    });
  }
  
  function handleMouseLeave() {
    // Suavizar el retorno al centro cuando el mouse sale
    state.targetEyeX = 0;
    state.targetEyeY = 0;
    
    // Resetear posición de cabello
    TweenMax.to(DOM.hair, 0.5, {
      x: 0,
      ease: "Power2.easeOut"
    });
  }
  
  function handleMouseEnter() {
    // Pequeño efecto al entrar al área del avatar
    TweenMax.to(DOM.mySVG, 0.3, {
      scale: 1.02,
      yoyo: true,
      repeat: 1,
      ease: "Power1.easeInOut"
    });
  }
  
  // Iniciar animación de seguimiento
  updateEyePosition();
  
  // Event listeners
  document.addEventListener('mousemove', handleMouseMove);
  DOM.mySVG.addEventListener('mouseleave', handleMouseLeave);
  DOM.mySVG.addEventListener('mouseenter', handleMouseEnter);
  
  // Limpiar al desmontar
  return () => {
    if (state.cursorTrackingRAF) {
      cancelAnimationFrame(state.cursorTrackingRAF);
    }
    document.removeEventListener('mousemove', handleMouseMove);
    DOM.mySVG.removeEventListener('mouseleave', handleMouseLeave);
    DOM.mySVG.removeEventListener('mouseenter', handleMouseEnter);
  };
}

// ============================================
// 4. MOSTRAR/OCULTAR CONTRASEÑA CON AVATAR
// ============================================
function setupPasswordToggle() {
  console.log('✅ Sistema de mostrar/ocultar contraseña activado');
  
  // Crear botón de toggle
  function createPasswordToggle() {
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'password-toggle';
    toggleBtn.innerHTML = `
      <span class="eye-icon">👁️</span>
    `;
    toggleBtn.setAttribute('aria-label', 'Mostrar contraseña');
    toggleBtn.setAttribute('title', 'Mostrar contraseña');
    
    // Insertar después del input de contraseña
    const passwordGroup = DOM.password.closest('.inputGroup');
    if (passwordGroup) {
      passwordGroup.appendChild(toggleBtn);
      state.passwordToggleBtn = toggleBtn;
    }
    
    return toggleBtn;
  }
  
  // Animación para cubrir ojos
  function coverEyes() {
    if (state.isCoveringEyes) return;
    
    state.isCoveringEyes = true;
    
    console.log('🙈 Cubriendo ojos...');
    
    // Detener seguimiento de cursor
    if (state.cursorTrackingRAF) {
      cancelAnimationFrame(state.cursorTrackingRAF);
      state.cursorTrackingRAF = null;
    }
    
    // Detener parpadeo
    if (state.blinkTimeout) {
      clearTimeout(state.blinkTimeout);
      state.blinkTimeout = null;
    }
    
    // Animación de los brazos cubriendo ojos
    TweenMax.to(DOM.armL, 0.6, {
      x: -93,
      y: 2,
      rotation: 0,
      ease: "Back.easeOut",
      onStart: () => {
        DOM.mySVG.classList.add('avatar-interacting');
      }
    });
    
    TweenMax.to(DOM.armR, 0.6, {
      x: -93,
      y: 2,
      rotation: 0,
      ease: "Back.easeOut",
      delay: 0.1,
      onComplete: () => {
        // Pequeño ajuste final
        TweenMax.to([DOM.armL, DOM.armR], 0.2, {
          y: 1,
          ease: "Power1.easeInOut"
        });
      }
    });
    
    // Ojos se cierran cuando se cubren
    TweenMax.to([DOM.eyeL, DOM.eyeR], 0.4, {
      scaleY: 0.1,
      ease: "Power2.easeOut",
      delay: 0.3
    });
    
    // Expresión de "vergüenza" o "timidez"
    TweenMax.to(DOM.mouth, 0.5, {
      y: 3,
      ease: "Power2.easeOut"
    });
    
    TweenMax.to(DOM.eyebrow, 0.5, {
      y: 2,
      skewX: -5,
      ease: "Power2.easeOut"
    });
    
    // Efecto en el formulario
    DOM.form.classList.add('password-visible');
  }
  
  // Animación para descubrir ojos
  function uncoverEyes() {
    if (!state.isCoveringEyes) return;
    
    state.isCoveringEyes = false;
    
    console.log('👀 Descubriendo ojos...');
    
    // Reanudar seguimiento de cursor
    if (!state.cursorTrackingRAF) {
      setupAdvancedCursorTracking();
    }
    
    // Reanudar parpadeo
    if (!state.blinkTimeout) {
      setupNaturalBlinking();
    }
    
    // Animación de los brazos volviendo a posición normal
    TweenMax.to(DOM.armL, 1.2, {
      y: 220,
      ease: "Back.easeOut",
      onStart: () => {
        // Ojos se abren antes de que se muevan los brazos
        TweenMax.to([DOM.eyeL, DOM.eyeR], 0.3, {
          scaleY: 1,
          ease: "Power2.easeOut"
        });
      }
    });
    
    TweenMax.to(DOM.armL, 1.2, {
      rotation: 105,
      ease: "Back.easeOut",
      delay: 0.1
    });
    
    TweenMax.to(DOM.armR, 1.2, {
      y: 220,
      ease: "Back.easeOut",
      delay: 0.05
    });
    
    TweenMax.to(DOM.armR, 1.2, {
      rotation: -105,
      ease: "Back.easeOut",
      delay: 0.15
    });
    
    // Restaurar expresión facial
    TweenMax.to([DOM.mouth, DOM.eyebrow], 0.8, {
      y: 0,
      skewX: 0,
      ease: "Power2.easeOut",
      delay: 0.5
    });
    
    // Efecto en el formulario
    DOM.form.classList.remove('password-visible');
    
    // Remover clase de interacción
    setTimeout(() => {
      DOM.mySVG.classList.remove('avatar-interacting');
    }, 1200);
    
    // Parpadeo después de descubrir
    setTimeout(() => {
      if (state.blinkTimeout) {
        clearTimeout(state.blinkTimeout);
        performBlink();
        scheduleBlink();
      }
    }, 1500);
  }
  
  // Función para realizar parpadeo (necesaria para uncoverEyes)
  function performBlink() {
    TweenMax.to([DOM.eyeL, DOM.eyeR], 0.12, {
      scaleY: 0.05,
      transformOrigin: "center center",
      yoyo: true,
      repeat: 1,
      ease: "Power1.easeInOut",
      onComplete: () => {
        TweenMax.to([DOM.eyeL, DOM.eyeR], 0.08, {
          scaleY: 1,
          ease: "Power1.easeOut"
        });
      }
    });
  }
  
  // Función para programar parpadeo (necesaria para uncoverEyes)
  function scheduleBlink() {
    if (state.blinkTimeout) clearTimeout(state.blinkTimeout);
    
    const delay = CONFIG.blinkInterval.min + 
                  Math.random() * (CONFIG.blinkInterval.max - CONFIG.blinkInterval.min);
    
    state.blinkTimeout = setTimeout(() => {
      performBlink();
      scheduleBlink();
    }, delay);
  }
  
  // Alternar visibilidad de contraseña
  function togglePasswordVisibility() {
    state.isPasswordVisible = !state.isPasswordVisible;
    
    const toggleBtn = state.passwordToggleBtn;
    const passwordInput = DOM.password;
    
    if (state.isPasswordVisible) {
      // Mostrar contraseña
      passwordInput.type = 'text';
      toggleBtn.innerHTML = '<span class="eye-icon">🔒</span>';
      toggleBtn.setAttribute('aria-label', 'Ocultar contraseña');
      toggleBtn.setAttribute('title', 'Ocultar contraseña');
      toggleBtn.classList.add('active');
      
      // Avatar cubre sus ojos
      coverEyes();
      
      // Expresión de "vergüenza" adicional
      TweenMax.to(DOM.mySVG, 0.3, {
        rotation: -5,
        yoyo: true,
        repeat: 2,
        ease: "Power1.easeInOut",
        transformOrigin: "center bottom",
        delay: 0.8
      });
      
      console.log('🔓 Contraseña visible - Avatar cubre sus ojos');
      
    } else {
      // Ocultar contraseña
      passwordInput.type = 'password';
      toggleBtn.innerHTML = '<span class="eye-icon">👁️</span>';
      toggleBtn.setAttribute('aria-label', 'Mostrar contraseña');
      toggleBtn.setAttribute('title', 'Mostrar contraseña');
      toggleBtn.classList.remove('active');
      
      // Avatar descubre sus ojos
      uncoverEyes();
      
      // Expresión de alivio
      TweenMax.to(DOM.mouth, 0.5, {
        y: -2,
        ease: "Power2.easeOut",
        delay: 1.2
      });
      
      console.log('🔒 Contraseña oculta - Avatar descubre sus ojos');
    }
    
    // Enfocar el input de contraseña después de toggle
    setTimeout(() => {
      passwordInput.focus();
      // Mover cursor al final
      const length = passwordInput.value.length;
      passwordInput.setSelectionRange(length, length);
    }, 100);
  }
  
  // Inicializar botón de toggle
  const toggleBtn = createPasswordToggle();
  
  // Event listeners
  toggleBtn.addEventListener('click', togglePasswordVisibility);
  
  // También permitir toggle con Alt+P (accesibilidad)
  document.addEventListener('keydown', (e) => {
    if ((e.altKey || e.metaKey) && e.key === 'p' && document.activeElement === DOM.password) {
      e.preventDefault();
      togglePasswordVisibility();
    }
  });
  
  // Cuando el campo de contraseña pierde el foco y la contraseña está visible, ocultarla
  DOM.password.addEventListener('blur', () => {
    if (state.isPasswordVisible && state.isCoveringEyes) {
      // Pequeño delay antes de ocultar
      setTimeout(() => {
        if (document.activeElement !== DOM.password && 
            document.activeElement !== toggleBtn) {
          togglePasswordVisibility();
        }
      }, 500);
    }
  });
  
  // Cubrir ojos cuando se enfoca el campo de contraseña (si está visible)
  DOM.password.addEventListener('focus', () => {
    if (state.isPasswordVisible && !state.isCoveringEyes) {
      coverEyes();
    }
  });
  
  return toggleBtn;
}

// ============================================
// 5. ESTADOS DE VALIDACIÓN VISUAL
// ============================================
function setupVisualValidation() {
  console.log('✅ Sistema de validación visual activado');
  
  const VALIDATION_STATES = {
    neutral: {
      color: '#217093',
      icon: '',
      expression: 'neutral',
      className: ''
    },
    valid: {
      color: '#4CAF50',
      icon: '✓',
      expression: 'happy',
      className: 'valid'
    },
    invalid: {
      color: '#F44336',
      icon: '✗',
      expression: 'sad',
      className: 'invalid'
    },
    loading: {
      color: '#2196F3',
      icon: '⟳',
      expression: 'thinking',
      className: 'loading'
    }
  };
  
  function validateEmail(email) {
    if (!email || email.trim() === '') return 'neutral';
    return CONFIG.validation.emailRegex.test(email) ? 'valid' : 'invalid';
  }
  
  function validatePassword(password) {
    if (!password || password.trim() === '') return 'neutral';
    return password.length >= CONFIG.validation.minPasswordLength ? 'valid' : 'invalid';
  }
  
  function createValidationIcon() {
    const icon = document.createElement('span');
    icon.className = 'validation-icon';
    return icon;
  }
  
  function updateValidationState(field, stateType) {
    const inputGroup = field.closest('.inputGroup');
    if (!inputGroup) return;
    
    const stateConfig = VALIDATION_STATES[stateType];
    const currentState = inputGroup.classList.contains('valid') ? 'valid' :
                        inputGroup.classList.contains('invalid') ? 'invalid' :
                        inputGroup.classList.contains('loading') ? 'loading' : 'neutral';
    
    // Si el estado no cambió, no hacer nada
    if (currentState === stateType && stateType !== 'neutral') return;
    
    // Remover todas las clases de estado
    inputGroup.classList.remove('valid', 'invalid', 'loading', 'has-icon');
    
    // Añadir nueva clase de estado si no es neutral
    if (stateType !== 'neutral') {
      inputGroup.classList.add(stateConfig.className, 'has-icon');
      
      // Actualizar borde del input
      const input = inputGroup.querySelector('input');
      if (input) {
        TweenMax.to(input, 0.3, {
          borderColor: stateConfig.color,
          boxShadow: `0 0 0 2px ${stateConfig.color}30`,
          ease: "Power2.easeOut"
        });
      }
      
      // Crear o actualizar icono
      let icon = inputGroup.querySelector('.validation-icon');
      if (!icon) {
        icon = createValidationIcon();
        inputGroup.appendChild(icon);
      }
      
      // Animación de entrada del icono
      icon.textContent = stateConfig.icon;
      icon.style.color = stateConfig.color;
      icon.classList.remove('exiting');
      icon.classList.add('entering');
      
      // Expresión del avatar (solo si no está cubriendo ojos)
      if (!state.isCoveringEyes) {
        showValidationExpression(stateConfig.expression);
      }
      
      // Remover clase de entrada después de la animación
      setTimeout(() => {
        icon.classList.remove('entering');
      }, 500);
      
    } else {
      // Estado neutral - restaurar valores por defecto
      const input = inputGroup.querySelector('input');
      if (input) {
        TweenMax.to(input, 0.3, {
          borderColor: '#217093',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
          ease: "Power2.easeOut"
        });
      }
      
      // Animación de salida del icono
      const icon = inputGroup.querySelector('.validation-icon');
      if (icon) {
        icon.classList.add('exiting');
        setTimeout(() => {
          if (icon.parentNode && icon.classList.contains('exiting')) {
            icon.remove();
          }
        }, 300);
      }
    }
    
    // Actualizar estado del formulario completo
    updateFormState();
  }
  
  function showValidationExpression(type) {
    // Cancelar animaciones previas
    TweenMax.killTweensOf([DOM.eyeL, DOM.eyeR, DOM.mouth, DOM.eyebrow]);
    
    switch(type) {
      case 'happy':
        TweenMax.to([DOM.eyeL, DOM.eyeR], 0.5, {
          scaleY: 1.2,
          ease: "Power2.easeOut"
        });
        TweenMax.to(DOM.mouth, 0.5, {
          y: -3,
          ease: "Power2.easeOut"
        });
        TweenMax.to(DOM.mySVG, 0.3, {
          y: -5,
          yoyo: true,
          repeat: 1,
          ease: "Power1.easeInOut"
        });
        break;
        
      case 'sad':
        TweenMax.to([DOM.eyeL, DOM.eyeR], 0.5, {
          scaleY: 0.85,
          ease: "Power2.easeOut"
        });
        TweenMax.to(DOM.eyebrow, 0.5, {
          y: 4,
          skewX: -8,
          ease: "Power2.easeOut"
        });
        TweenMax.to(DOM.mouth, 0.5, {
          y: 2,
          ease: "Power2.easeOut"
        });
        break;
        
      case 'thinking':
        TweenMax.to([DOM.eyeL, DOM.eyeR], 0.5, {
          scaleX: 0.8,
          ease: "Power2.easeOut"
        });
        TweenMax.to(DOM.mouth, 0.5, {
          x: 3,
          ease: "Power2.easeOut"
        });
        // Movimiento de cabeza pensativo
        TweenMax.to(DOM.mySVG, 0.8, {
          rotation: 5,
          yoyo: true,
          repeat: -1,
          ease: "Power1.easeInOut"
        });
        break;
    }
    
    // Volver a neutral después de 1.5 segundos
    setTimeout(() => {
      TweenMax.to([DOM.eyeL, DOM.eyeR, DOM.mouth, DOM.eyebrow], 0.8, {
        scaleX: 1,
        scaleY: 1,
        x: 0,
        y: 0,
        skewX: 0,
        ease: "Power2.easeOut"
      });
      TweenMax.killTweensOf(DOM.mySVG); // Detener animación de cabeza pensativa
    }, 1500);
  }
  
  function updateFormState() {
    const emailState = validateEmail(DOM.email.value);
    const passwordState = validatePassword(DOM.password.value);
    
    // Remover todas las clases de estado del formulario
    DOM.form.classList.remove('valid', 'invalid', 'loading', 'shake');
    
    // Determinar estado general del formulario
    if (emailState === 'valid' && passwordState === 'valid') {
      DOM.form.classList.add('valid');
    } else if (emailState === 'invalid' || passwordState === 'invalid') {
      DOM.form.classList.add('invalid');
    }
  }
  
  function showSuccessAnimation() {
    // Crear confetti
    const confettiCount = 25;
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      DOM.form.appendChild(confetti);
      
      // Posición inicial aleatoria
      const startX = 50 + Math.random() * 50;
      const startY = 50 + Math.random() * 50;
      
      TweenMax.set(confetti, {
        left: `${startX}%`,
        top: `${startY}%`
      });
      
      // Animación de confetti
      TweenMax.to(confetti, 1 + Math.random() * 0.5, {
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        rotation: Math.random() * 360,
        scale: 0,
        opacity: 1,
        ease: "Power2.easeOut",
        delay: Math.random() * 0.3,
        onStart: () => {
          confetti.style.opacity = '1';
        },
        onComplete: () => {
          if (confetti.parentNode) {
            confetti.remove();
          }
        }
      });
    }
    
    // Avatar muy feliz (si no está cubriendo ojos)
    if (!state.isCoveringEyes) {
      TweenMax.to([DOM.eyeL, DOM.eyeR], 0.3, {
        scaleY: 1.4,
        yoyo: true,
        repeat: 3,
        ease: "Power1.easeInOut"
      });
      
      // Movimiento de celebración
      TweenMax.to(DOM.mySVG, 0.2, {
        y: -10,
        yoyo: true,
        repeat: 5,
        ease: "Power1.easeInOut"
      });
    }
  }
  
  function showErrorAnimation() {
    // Sacudida del formulario
    DOM.form.classList.add('shake');
    setTimeout(() => {
      DOM.form.classList.remove('shake');
    }, 500);
    
    // Avatar triste con sacudida (si no está cubriendo ojos)
    if (!state.isCoveringEyes) {
      TweenMax.to(DOM.eyebrow, 0.15, {
        y: 6,
        skewX: -12,
        yoyo: true,
        repeat: 3,
        ease: "Power1.easeInOut"
      });
      
      TweenMax.to(DOM.mySVG, 0.1, {
        x: 5,
        yoyo: true,
        repeat: 5,
        ease: "Power1.easeInOut"
      });
    }
  }
  
  function setLoadingState(loading) {
    const button = DOM.loginBtn;
    if (loading) {
      button.disabled = true;
      button.classList.add('loading');
      button.textContent = '';
      
      // Actualizar estados a loading
      updateValidationState(DOM.email, 'loading');
      updateValidationState(DOM.password, 'loading');
      
    } else {
      button.disabled = false;
      button.classList.remove('loading');
      button.textContent = 'Log in';
      
      // Restaurar estados según validación actual
      updateValidationState(DOM.email, validateEmail(DOM.email.value));
      updateValidationState(DOM.password, validatePassword(DOM.password.value));
    }
  }
  
  // Event listeners para validación en tiempo real
  DOM.email.addEventListener('input', (e) => {
    const validationState = validateEmail(e.target.value);
    updateValidationState(e.target, validationState);
  });
  
  DOM.password.addEventListener('input', (e) => {
    const validationState = validatePassword(e.target.value);
    updateValidationState(e.target, validationState);
  });
  
  DOM.email.addEventListener('blur', (e) => {
    const validationState = validateEmail(e.target.value);
    updateValidationState(e.target, validationState);
  });
  
  DOM.password.addEventListener('blur', (e) => {
    const validationState = validatePassword(e.target.value);
    updateValidationState(e.target, validationState);
  });
  
  // Manejar envío del formulario
  DOM.loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Si la contraseña está visible, ocultarla primero
    if (state.isPasswordVisible) {
      // Ocultar contraseña antes de enviar
      const togglePassword = () => {
        state.isPasswordVisible = !state.isPasswordVisible;
        DOM.password.type = 'password';
        if (state.passwordToggleBtn) {
          state.passwordToggleBtn.innerHTML = '<span class="eye-icon">👁️</span>';
          state.passwordToggleBtn.classList.remove('active');
        }
        uncoverEyes();
        
        // Proceder con el envío después de ocultar
        setTimeout(processLogin, 500);
      };
      
      togglePassword();
    } else {
      processLogin();
    }
    
    function processLogin() {
      // Validar ambos campos
      const emailState = validateEmail(DOM.email.value);
      const passwordState = validatePassword(DOM.password.value);
      
      if (emailState === 'valid' && passwordState === 'valid') {
        // Mostrar estado de carga
        setLoadingState(true);
        
        // Simular envío del formulario (en una app real, sería una petición AJAX)
        setTimeout(() => {
          setLoadingState(false);
          showSuccessAnimation();
          
          // Aquí iría el código real para enviar el formulario
          console.log('Formulario enviado correctamente');
          console.log('Email:', DOM.email.value);
          console.log('Password:', '••••••••');
          
          // Resetear formulario después de éxito (opcional)
          setTimeout(() => {
            DOM.email.value = '';
            DOM.password.value = '';
            updateValidationState(DOM.email, 'neutral');
            updateValidationState(DOM.password, 'neutral');
          }, 2000);
          
        }, 2000);
        
      } else {
        // Mostrar errores
        if (emailState !== 'valid') updateValidationState(DOM.email, 'invalid');
        if (passwordState !== 'valid') updateValidationState(DOM.password, 'invalid');
        
        showErrorAnimation();
        
        // Enfocar el primer campo con error
        if (emailState !== 'valid') {
          DOM.email.focus();
        } else if (passwordState !== 'valid') {
          DOM.password.focus();
        }
      }
    }
  });
}

// ============================================
// FUNCIONES ORIGINALES DEL AVATAR (MODIFICADAS)
// ============================================
var caretPos, curEmailIndex, screenCenter, svgCoords, dFromC, eyeDistH, eyeLDistV, eyeRDistV, eyeDistR;

function getCoord(e) {
  if (!e || !DOM.email) return;
  
  var carPos = DOM.email.selectionEnd,
    div = document.createElement('div'),
    span = document.createElement('span'),
    copyStyle = getComputedStyle(DOM.email),
    emailCoords = {}, caretCoords = {}, centerCoords = {}
  ;
  
  [].forEach.call(copyStyle, function(prop){
    div.style[prop] = copyStyle[prop];
  });
  
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre';
  document.body.appendChild(div);
  
  div.textContent = DOM.email.value.substr(0, carPos);
  span.textContent = DOM.email.value.substr(carPos) || '.';
  div.appendChild(span);
  
  emailCoords = getPosition(DOM.email);
  caretCoords = getPosition(span);
  centerCoords = getPosition(DOM.mySVG);
  svgCoords = getPosition(DOM.mySVG);
  screenCenter = centerCoords.x + (DOM.mySVG.offsetWidth / 2);
  caretPos = caretCoords.x + emailCoords.x;
  
  dFromC = screenCenter - caretPos;
  var pFromC = Math.round((caretPos / screenCenter) * 100) / 100;
  if(pFromC < 1) {
    
  } else if(pFromC > 1) {
    pFromC -= 2;
    pFromC = Math.abs(pFromC);
  }

  eyeDistH = -dFromC * .05;
  if(eyeDistH > CONFIG.eyeMaxHorizD) {
    eyeDistH = CONFIG.eyeMaxHorizD;
  } else if(eyeDistH < -CONFIG.eyeMaxHorizD) {
    eyeDistH = -CONFIG.eyeMaxHorizD;
  }
  
  var eyeLCoords = {x: svgCoords.x + 84, y: svgCoords.y + 76};
  var eyeRCoords = {x: svgCoords.x + 113, y: svgCoords.y + 76};
  var noseCoords = {x: svgCoords.x + 97, y: svgCoords.y + 81};
  var mouthCoords = {x: svgCoords.x + 100, y: svgCoords.y + 100};
  var eyeLAngle = getAngle(eyeLCoords.x, eyeLCoords.y, emailCoords.x + caretCoords.x, emailCoords.y + 25);
  var eyeLX = Math.cos(eyeLAngle) * CONFIG.eyeMaxHorizD;
  var eyeLY = Math.sin(eyeLAngle) * CONFIG.eyeMaxVertD;
  var eyeRAngle = getAngle(eyeRCoords.x, eyeRCoords.y, emailCoords.x + caretCoords.x, emailCoords.y + 25);
  var eyeRX = Math.cos(eyeRAngle) * CONFIG.eyeMaxHorizD;
  var eyeRY = Math.sin(eyeRAngle) * CONFIG.eyeMaxVertD;
  var noseAngle = getAngle(noseCoords.x, noseCoords.y, emailCoords.x + caretCoords.x, emailCoords.y + 25);
  var noseX = Math.cos(noseAngle) * CONFIG.noseMaxHorizD;
  var noseY = Math.sin(noseAngle) * CONFIG.noseMaxVertD;
  var mouthAngle = getAngle(mouthCoords.x, mouthCoords.y, emailCoords.x + caretCoords.x, emailCoords.y + 25);
  var mouthX = Math.cos(mouthAngle) * CONFIG.noseMaxHorizD;
  var mouthY = Math.sin(mouthAngle) * CONFIG.noseMaxVertD;
  var mouthR = Math.cos(mouthAngle) * 6;
  var chinX = mouthX * .8;
  var chinY = mouthY * .5;
  var chinS = 1 - ((dFromC * .15) / 100);
  if(chinS > 1) {chinS = 1 - (chinS - 1);}
  var faceX = mouthX * .3;
  var faceY = mouthY * .4;
  var faceSkew = Math.cos(mouthAngle) * 5;
  var eyebrowSkew = Math.cos(mouthAngle) * 25;
  var outerEarX = Math.cos(mouthAngle) * 4;
  var outerEarY = Math.cos(mouthAngle) * 5;
  var hairX = Math.cos(mouthAngle) * 6;
  var hairS = 1.2;
  
  // Animaciones suaves
  TweenMax.to(DOM.eyeL, 0.7, {x: -eyeLX , y: -eyeLY, ease: CONFIG.animationEase});
  TweenMax.to(DOM.eyeR, 0.7, {x: -eyeRX , y: -eyeRY, ease: CONFIG.animationEase});
  TweenMax.to(DOM.nose, 0.7, {x: -noseX, y: -noseY, rotation: mouthR, transformOrigin: "center center", ease: CONFIG.animationEase});
  TweenMax.to(DOM.mouth, 0.7, {x: -mouthX , y: -mouthY, rotation: mouthR, transformOrigin: "center center", ease: CONFIG.animationEase});
  TweenMax.to(DOM.chin, 0.7, {x: -chinX, y: -chinY, scaleY: chinS, ease: CONFIG.animationEase});
  TweenMax.to(DOM.face, 0.7, {x: -faceX, y: -faceY, skewX: -faceSkew, transformOrigin: "center top", ease: CONFIG.animationEase});
  TweenMax.to(DOM.eyebrow, 0.7, {x: -faceX, y: -faceY, skewX: -eyebrowSkew, transformOrigin: "center top", ease: CONFIG.animationEase});
  TweenMax.to(DOM.outerEarL, 0.7, {x: outerEarX, y: -outerEarY, ease: CONFIG.animationEase});
  TweenMax.to(DOM.outerEarR, 0.7, {x: outerEarX, y: outerEarY, ease: CONFIG.animationEase});
  TweenMax.to(DOM.earHairL, 0.7, {x: -outerEarX, y: -outerEarY, ease: CONFIG.animationEase});
  TweenMax.to(DOM.earHairR, 0.7, {x: -outerEarX, y: outerEarY, ease: CONFIG.animationEase});
  TweenMax.to(DOM.hair, 0.7, {x: hairX, scaleY: hairS, transformOrigin: "center bottom", ease: CONFIG.animationEase});
  
  document.body.removeChild(div);
}

function onEmailInput(e) {
  getCoord(e);
  var value = e.target.value;
  curEmailIndex = value.length;
  
  if(curEmailIndex > 0) {
    if(state.mouthStatus == "small") {
      state.mouthStatus = "medium";
      TweenMax.to([DOM.mouthBG, DOM.mouthOutline, DOM.mouthMaskPath], 0.7, {morphSVG: DOM.mouthMediumBG, shapeIndex: 8, ease: CONFIG.animationEase});
      TweenMax.to(DOM.tooth, 0.7, {x: 0, y: 0, ease: CONFIG.animationEase});
      TweenMax.to(DOM.tongue, 0.7, {x: 0, y: 1, ease: CONFIG.animationEase});
      TweenMax.to([DOM.eyeL, DOM.eyeR], 0.7, {scaleX: .85, scaleY: .85, ease: CONFIG.animationEase});
    }
    if(value.includes("@")) {
      state.mouthStatus = "large";
      TweenMax.to([DOM.mouthBG, DOM.mouthOutline, DOM.mouthMaskPath], 0.7, {morphSVG: DOM.mouthLargeBG, ease: CONFIG.animationEase});
      TweenMax.to(DOM.tooth, 0.7, {x: 3, y: -2, ease: CONFIG.animationEase});
      TweenMax.to(DOM.tongue, 0.7, {y: 2, ease: CONFIG.animationEase});
      TweenMax.to([DOM.eyeL, DOM.eyeR], 0.7, {scaleX: .65, scaleY: .65, ease: CONFIG.animationEase, transformOrigin: "center center"});
    } else {
      state.mouthStatus = "medium";
      TweenMax.to([DOM.mouthBG, DOM.mouthOutline, DOM.mouthMaskPath], 0.7, {morphSVG: DOM.mouthMediumBG, ease: CONFIG.animationEase});
      TweenMax.to(DOM.tooth, 0.7, {x: 0, y: 0, ease: CONFIG.animationEase});
      TweenMax.to(DOM.tongue, 0.7, {x: 0, y: 1, ease: CONFIG.animationEase});
      TweenMax.to([DOM.eyeL, DOM.eyeR], 0.7, {scaleX: .85, scaleY: .85, ease: CONFIG.animationEase});
    }
  } else {
    state.mouthStatus = "small";
    TweenMax.to([DOM.mouthBG, DOM.mouthOutline, DOM.mouthMaskPath], 0.7, {morphSVG: DOM.mouthSmallBG, shapeIndex: 9, ease: CONFIG.animationEase});
    TweenMax.to(DOM.tooth, 0.7, {x: 0, y: 0, ease: CONFIG.animationEase});
    TweenMax.to(DOM.tongue, 0.7, {y: 0, ease: CONFIG.animationEase});
    TweenMax.to([DOM.eyeL, DOM.eyeR], 0.7, {scaleX: 1, scaleY: 1, ease: CONFIG.animationEase});
  }
}

function onEmailFocus(e) {
  state.isEmailFocused = true;
  e.target.parentElement.classList.add("focusWithText");
  getCoord();
}

function onEmailBlur(e) {
  state.isEmailFocused = false;
  if(e.target.value == "") {
    e.target.parentElement.classList.remove("focusWithText");
  }
  resetFace();
}

function onPasswordFocus(e) {
  state.isPasswordFocused = true;
}

function onPasswordBlur(e) {
  state.isPasswordFocused = false;
}

function resetFace() {
  TweenMax.to([DOM.eyeL, DOM.eyeR], 0.8, {x: 0, y: 0, ease: CONFIG.animationEase});
  TweenMax.to(DOM.nose, 0.8, {x: 0, y: 0, scaleX: 1, scaleY: 1, ease: CONFIG.animationEase});
  TweenMax.to(DOM.mouth, 0.8, {x: 0, y: 0, rotation: 0, ease: CONFIG.animationEase});
  TweenMax.to(DOM.chin, 0.8, {x: 0, y: 0, scaleY: 1, ease: CONFIG.animationEase});
  TweenMax.to([DOM.face, DOM.eyebrow], 0.8, {x: 0, y: 0, skewX: 0, ease: CONFIG.animationEase});
  TweenMax.to([DOM.outerEarL, DOM.outerEarR, DOM.earHairL, DOM.earHairR, DOM.hair], 0.8, {x: 0, y: 0, scaleY: 1, ease: CONFIG.animationEase});
}

function getAngle(x1, y1, x2, y2) {
  var angle = Math.atan2(y1 - y2, x1 - x2);
  return angle;
}

function getPosition(el) {
  var xPos = 0;
  var yPos = 0;

  while (el) {
    if (el.tagName == "BODY") {
      var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      var yScroll = el.scrollTop || document.documentElement.scrollTop;

      xPos += (el.offsetLeft - xScroll + el.clientLeft);
      yPos += (el.offsetTop - yScroll + el.clientTop);
    } else {
      xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      yPos += (el.offsetTop - el.scrollTop + el.clientTop);
    }

    el = el.offsetParent;
  }
  return {
    x: xPos,
    y: yPos
  };
}

// ============================================
// INICIALIZACIÓN Y CONFIGURACIÓN FINAL
// ============================================
function init() {
  if (state.isInitialized) return;
  
  console.log('🚀 Inicializando formulario con avatar interactivo...');
  
  // Verificar que todos los elementos DOM existan
  const requiredElements = ['email', 'password', 'mySVG', 'form', 'loginBtn'];
  for (const element of requiredElements) {
    if (!DOM[element]) {
      console.error(`❌ Elemento requerido no encontrado: ${element}`);
      return;
    }
  }
  
  // Configurar todas las funcionalidades
  setupNaturalBlinking();
  setupKeyboardReactions();
  const cleanupCursorTracking = setupAdvancedCursorTracking();
  setupPasswordToggle();
  setupVisualValidation();
  
  // Event listeners originales
  DOM.email.addEventListener('focus', onEmailFocus);
  DOM.email.addEventListener('blur', onEmailBlur);
  DOM.email.addEventListener('input', onEmailInput);
  DOM.password.addEventListener('focus', onPasswordFocus);
  DOM.password.addEventListener('blur', onPasswordBlur);
  
  // Posición inicial de brazos
  TweenMax.set(DOM.armL, {x: -93, y: 220, rotation: 105, transformOrigin: "top left"});
  TweenMax.set(DOM.armR, {x: -93, y: 220, rotation: -105, transformOrigin: "top right"});
  
  // Configurar para evitar envío del formulario por defecto
  DOM.form.addEventListener('submit', (e) => {
    e.preventDefault();
    DOM.loginBtn.click();
  });
  
  // Limpiar al desmontar
  window.addEventListener('beforeunload', () => {
    if (cleanupCursorTracking) cleanupCursorTracking();
    if (state.blinkTimeout) clearTimeout(state.blinkTimeout);
    if (state.backspaceTimer) clearTimeout(state.backspaceTimer);
    if (state.cursorTrackingRAF) cancelAnimationFrame(state.cursorTrackingRAF);
  });
  
  // Marcar como inicializado
  state.isInitialized = true;
  
  console.log('✅ Formulario interactivo inicializado correctamente');
  console.log('✨ Características activadas:');
  console.log('   • Parpadeo natural');
  console.log('   • Reacciones a teclado');
  console.log('   • Seguimiento de cursor mejorado');
  console.log('   • Mostrar/ocultar contraseña con avatar');
  console.log('   • Validación visual');
  
  // Efecto de entrada
  TweenMax.from(DOM.form, 0.8, {
    opacity: 0,
    y: 30,
    ease: "Power2.easeOut"
  });
  
  TweenMax.from(DOM.mySVG, 0.6, {
    scale: 0.8,
    rotation: -10,
    ease: "Back.easeOut",
    delay: 0.2
  });
}

// ============================================
// INICIAR CUANDO EL DOCUMENTO ESTÉ LISTO
// ============================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // El documento ya está listo
  setTimeout(init, 100); // Pequeño delay para asegurar que todo esté cargado
}

// Exportar funciones para uso externo (si es necesario)
window.avatarForm = {
  init,
  resetFace,
  showPassword: () => {
    if (state.passwordToggleBtn) {
      state.passwordToggleBtn.click();
    }
  },
  hidePassword: () => {
    if (state.isPasswordVisible && state.passwordToggleBtn) {
      state.passwordToggleBtn.click();
    }
  },
  showSuccessAnimation: () => {
    // Función auxiliar para mostrar éxito
    const showValidationExpression = (type) => {
      // Implementación simplificada
      if (type === 'happy') {
        TweenMax.to([DOM.eyeL, DOM.eyeR], 0.5, {
          scaleY: 1.2,
          ease: "Power2.easeOut"
        });
      }
    };
    showValidationExpression('happy');
  },
  showErrorAnimation: () => {
    DOM.form.classList.add('shake');
    setTimeout(() => DOM.form.classList.remove('shake'), 500);
  }
};
