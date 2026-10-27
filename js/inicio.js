// Busca el espacio donde se mostrará la mano robótica
const contenedorModelo = document.getElementById('modeloTridimensional');

// Crea la escena, la cámara y el elemento donde se dibuja el modelo
const escena = new THREE.Scene();

const camara = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderizador = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

// Ajusta el tamaño y la calidad de la imagen
renderizador.setSize(window.innerWidth, window.innerHeight);
renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Activa las sombras y ajusta la forma en que se muestra la iluminación
renderizador.shadowMap.enabled = true;
renderizador.toneMapping = THREE.ACESFilmicToneMapping;

// Agrega el dibujo tridimensional a la página
contenedorModelo.appendChild(renderizador.domElement);


// Ilumina el modelo desde diferentes direcciones
const luzAmbiente = new THREE.AmbientLight(0xffffff, 1.0);
escena.add(luzAmbiente);

const luzPrincipal = new THREE.DirectionalLight(0xffffff, 2.0);
luzPrincipal.position.set(5, 8, 5);
escena.add(luzPrincipal);

const luzRelleno = new THREE.DirectionalLight(0x94a3b8, 1.2);
luzRelleno.position.set(-5, -2, -4);
escena.add(luzRelleno);

const luzContorno = new THREE.PointLight(0xffffff, 2.0);
luzContorno.position.set(0, 4, -4);
escena.add(luzContorno);


// Guarda el modelo cuando termina de cargarse
let manoRobotica = null;

// Indica la ubicación del archivo de la mano robótica
const rutaModelo = '../modelos/mano_esqueleto.glb';

// Crea el cargador para abrir el archivo tridimensional
const cargadorModelo = new THREE.GLTFLoader();

// Carga el modelo y lo agrega a la escena
cargadorModelo.load(
    rutaModelo,

    (archivo) => {
        manoRobotica = archivo.scene;

        // Define el tamaño y la posición inicial de la mano
        manoRobotica.scale.set(2.0, 2.0, 2.0);
        manoRobotica.position.set(0, 0, 0);

        // Establece la orientación inicial del modelo
        manoRobotica.rotation.z = 0.0;
        manoRobotica.rotation.x = 0.0;

        // Permite que las partes del modelo reciban y proyecten sombras
        manoRobotica.traverse((parte) => {
            if (parte.isMesh) {
                parte.castShadow = true;
                parte.receiveShadow = true;
            }
        });

        // Agrega la mano a la escena tridimensional
        escena.add(manoRobotica);
    },

    undefined,

    (error) => {
        // Muestra el error si el archivo no se puede cargar
        console.error('Error al cargar el modelo de la mano:', error);
    }
);

// Coloca la cámara frente al modelo
camara.position.z = 4.5;


// Controla el avance de la página y los paneles informativos
let avancePagina = 0;
let desplazamientoAnterior = window.scrollY;
let panelAnterior = 0;

// Guarda los cuatro paneles que contienen la información
const panelesInformativos = document.querySelectorAll('.panelInformativo');


// Detecta cuando el usuario se desplaza por la página
window.addEventListener('scroll', () => {
    const desplazamientoActual = window.scrollY;

    // Calcula qué parte de la página se ha recorrido
    const desplazamientoMaximo =
        document.documentElement.scrollHeight - window.innerHeight;

    avancePagina = Math.min(
        Math.max(desplazamientoActual / desplazamientoMaximo, 0),
        1
    );

    // Selecciona el panel que corresponde al avance de la página
    let panelActivo = 0;

    if (avancePagina > 0.25 && avancePagina <= 0.5) {
        panelActivo = 1;
    } else if (avancePagina > 0.5 && avancePagina <= 0.75) {
        panelActivo = 2;
    } else if (avancePagina > 0.75) {
        panelActivo = 3;
    }

    // Comprueba si el usuario está bajando o subiendo
    const desplazamientoHaciaAbajo =
        desplazamientoActual > desplazamientoAnterior;

    desplazamientoAnterior = desplazamientoActual;

    // Cambia los paneles solamente cuando cambia el tramo de la página
    if (panelActivo !== panelAnterior) {
        const panelQueSale = panelesInformativos[panelAnterior];
        const panelQueEntra = panelesInformativos[panelActivo];

        // Oculta el panel anterior según la dirección del desplazamiento
        panelQueSale.classList.remove('activo');
        panelQueSale.classList.remove('salirArriba', 'salirAbajo');

        if (desplazamientoHaciaAbajo) {
            panelQueSale.classList.add('salirArriba');
        } else {
            panelQueSale.classList.add('salirAbajo');
        }

        // Prepara el nuevo panel antes de mostrarlo
        panelQueEntra.classList.remove(
            'activo',
            'salirArriba',
            'salirAbajo'
        );

        panelQueEntra.style.transition = 'none';

        // Coloca el panel fuera de su posición para iniciar la animación
        if (desplazamientoHaciaAbajo) {
            panelQueEntra.style.transform =
                'translate(-50%, -50%) translateY(60px) scale(0.95)';
        } else {
            panelQueEntra.style.transform =
                'translate(-50%, -50%) translateY(-60px) scale(0.95)';
        }

        // Aplica la posición inicial antes de comenzar la transición
        void panelQueEntra.offsetWidth;

        // Restablece los estilos y muestra el panel nuevo
        panelQueEntra.style.transition = '';
        panelQueEntra.style.transform = '';
        panelQueEntra.classList.add('activo');

        // Guarda el número del panel que se está mostrando
        panelAnterior = panelActivo;
    }
});


// Anima la escena y cambia la orientación de la mano según el avance
function animarEscena() {
    requestAnimationFrame(animarEscena);

    if (manoRobotica) {
        // Calcula cuánto debe girar la mano en cada dirección
        const giroHorizontal = avancePagina * Math.PI * 1.2;
        const giroVertical = avancePagina * Math.PI * 0.5;

        // Suaviza el giro para evitar movimientos bruscos
        manoRobotica.rotation.x = THREE.MathUtils.lerp(
            manoRobotica.rotation.x,
            giroHorizontal,
            0.1
        );

        manoRobotica.rotation.y = THREE.MathUtils.lerp(
            manoRobotica.rotation.y,
            giroVertical,
            0.1
        );
    }

    // Dibuja la escena en cada actualización
    renderizador.render(escena, camara);
}

// Inicia la animación de la escena
animarEscena();


// Ajusta la cámara y el tamaño del modelo cuando cambia la ventana
window.addEventListener('resize', () => {
    camara.aspect = window.innerWidth / window.innerHeight;
    camara.updateProjectionMatrix();

    renderizador.setSize(window.innerWidth, window.innerHeight);
});