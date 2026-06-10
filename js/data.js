const WEEKS = [
  {
    id: "s1",
    tag: "SEM 1/6",
    hours: 10,
    t1: "Fundamentos y ROS2",
    t2: "Qué es un robot · coordenadas · URDF · primer nodo",
    obj: "Comprender qué es un robot, sus componentes, sistemas de coordenadas y cinemática básica; dar los primeros pasos en ROS2.",
    conceptos: [
      { t: "Nodo",    d: "Proceso independiente que ejecuta lógica. Equivalente a un microservicio." },
      { t: "Tópico",  d: "Canal pub/sub asíncrono. Los nodos publican y se suscriben sin conocerse directamente." },
      { t: "Mensaje", d: "Estructura de datos tipada que viaja por un tópico (ej: String, Float64, Twist)." },
      { t: "URDF",    d: "XML que describe la geometría, masa y joints de un robot. Es el 'blueprint'." },
    ],
    snippet: {
      l: "Minimal Publisher (Python)",
      c: `import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinPub(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.pub = self.create_publisher(String, 'topic', 10)
        self.create_timer(1.0, self.cb)

    def cb(self):
        msg = String()
        msg.data = 'Hola ROS2'
        self.pub.publish(msg)

rclpy.init()
rclpy.spin(MinPub())`,
    },
    topics: [
      "Arquitectura de robot (3 capas)",
      "Frames y coordenadas",
      "Matrices de rotación",
      "Quaterniones (intro)",
      "URDF en XML",
      "TurtleSim",
      "Nodo Publisher/Subscriber",
    ],
    topicDetails: {
      "Arquitectura de robot (3 capas)": {
        desc: "Todo robot tiene tres capas que se comunican en cascada: Percepción (sensores → datos crudos), Planeación (datos → decisión) y Actuación (decisión → movimiento físico). En ROS2 cada capa es uno o más nodos. Separar capas permite reemplazar, por ejemplo, el sensor sin tocar el controlador.",
        codeLabel: "Ejemplo de flujo por capas",
        code: `# Capa 1: Percepción
/camera/image_raw  →  /detector_node  →  /obstacle_detected

# Capa 2: Planeación
/obstacle_detected  →  /planner_node  →  /goal_pose

# Capa 3: Actuación
/goal_pose  →  /controller_node  →  /cmd_vel  →  motores`,
      },
      "Frames y coordenadas": {
        desc: "Un frame es un sistema de coordenadas con nombre, origen y orientación. En robótica usamos la regla de la mano derecha: X adelante, Y izquierda, Z arriba. TF2 mantiene un árbol de frames donde cada uno conoce su posición relativa al padre. Sin frames consistentes, dos sensores no pueden 'hablar' sobre el mismo punto del espacio.",
        codeLabel: "Regla de la mano derecha en ROS2",
        code: `# Ejes estándar REP-103 (ROS Enhancement Proposal)
# X → adelante (rojo)
# Y → izquierda (verde)
# Z → arriba (azul)

# Frames típicos de un robot móvil:
# map        → frame del mundo (fijo)
# odom       → frame de odometría (acumula drift)
# base_link  → centro del robot
# base_scan  → posición del LiDAR`,
      },
      "Matrices de rotación": {
        desc: "Una matriz de rotación 3×3 describe la orientación de un frame respecto a otro. La columna i de la matriz dice hacia dónde apunta el eje i del frame rotado. Son ortogonales (R·Rᵀ = I) y su determinante es siempre 1. En ROS2 rara vez las usas directamente — se usan quaterniones — pero entenderlas te ayuda a debuggear transformadas.",
        codeLabel: "Rotación 90° en Z (yaw) con NumPy",
        code: `import numpy as np

# Rotación 90° alrededor del eje Z
theta = np.pi / 2
Rz = np.array([
    [np.cos(theta), -np.sin(theta), 0],
    [np.sin(theta),  np.cos(theta), 0],
    [0,              0,             1]
])

# Un punto en X positivo queda en Y positivo
p = np.array([1, 0, 0])
print(Rz @ p)  # → [0, 1, 0]`,
      },
      "Quaterniones (intro)": {
        desc: "Los quaterniones q = (x, y, z, w) representan rotaciones 3D sin el problema de gimbal lock que tienen los ángulos de Euler. El componente w≈1 significa 'poca rotación'; w=0 significa 180°. En ROS2 se usan en geometry_msgs/Quaternion. Para rotar 90° en yaw: x=0, y=0, z=0.707, w=0.707.",
        codeLabel: "Convertir ángulos de Euler a quaternión",
        code: `from scipy.spatial.transform import Rotation

# Yaw = 90°, pitch = 0°, roll = 0°
r = Rotation.from_euler('xyz', [0, 0, 90], degrees=True)
q = r.as_quat()  # [x, y, z, w]
print(q)  # [0.0, 0.0, 0.707, 0.707]

# Librería tf_transformations (más común en ROS2)
from tf_transformations import quaternion_from_euler
q = quaternion_from_euler(0, 0, 1.5708)  # roll, pitch, yaw`,
      },
      "URDF en XML": {
        desc: "URDF (Unified Robot Description Format) es el archivo XML que define la geometría, masa, inercia y joints de un robot. Un 'link' es un eslabón rígido (cuerpo) y un 'joint' es la conexión entre dos links. Los joints pueden ser fixed, revolute (gira) o prismatic (desliza). RViz2 y Gazebo lo usan para visualizar y simular el robot.",
        codeLabel: "Estructura mínima de URDF",
        code: `<?xml version="1.0"?>
<robot name="mi_robot">

  <link name="base_link">
    <visual>
      <geometry><box size="0.3 0.2 0.1"/></geometry>
    </visual>
  </link>

  <link name="rueda_izq">
    <visual>
      <geometry><cylinder radius="0.05" length="0.04"/></geometry>
    </visual>
  </link>

  <joint name="joint_rueda_izq" type="revolute">
    <parent link="base_link"/>
    <child  link="rueda_izq"/>
    <origin xyz="0 0.12 0" rpy="1.5708 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1e9" upper="1e9" effort="10" velocity="5"/>
  </joint>

</robot>`,
      },
      "TurtleSim": {
        desc: "TurtleSim es el 'Hola Mundo' de ROS2: un simulador 2D de una tortuga que se mueve en pantalla. Sirve para aprender a publicar en /turtle1/cmd_vel, leer de /turtle1/pose y entender la interfaz de tópicos y servicios sin configurar Gazebo. Es parte del paquete ros-humble-turtlesim.",
        codeLabel: "Comandos básicos de TurtleSim",
        code: `# Instalar y lanzar
sudo apt install ros-humble-turtlesim
ros2 run turtlesim turtlesim_node

# Control por teclado (otra terminal)
ros2 run turtlesim turtle_teleop_key

# Publicar velocidad directamente
ros2 topic pub /turtle1/cmd_vel geometry_msgs/msg/Twist \
  "{linear: {x: 2.0}, angular: {z: 1.8}}"

# Ver posición de la tortuga
ros2 topic echo /turtle1/pose`,
      },
      "Nodo Publisher/Subscriber": {
        desc: "El patrón Pub/Sub es la comunicación asíncrona principal de ROS2. Un Publisher envía mensajes a un tópico sin saber quién escucha; un Subscriber recibe mensajes sin saber quién publica. El QoS (Quality of Service) define el comportamiento de la cola: RELIABLE garantiza entrega, BEST_EFFORT es más rápido pero puede perder mensajes.",
        codeLabel: "Publisher + Subscriber en el mismo nodo",
        code: `import rclpy
from rclpy.node import Node
from std_msgs.msg import Float64

class EcoNodo(Node):
    def __init__(self):
        super().__init__('eco')
        self.pub = self.create_publisher(Float64, '/salida', 10)
        self.create_subscription(Float64, '/entrada', self.cb, 10)

    def cb(self, msg):
        doble = Float64()
        doble.data = msg.data * 2
        self.pub.publish(doble)
        self.get_logger().info(f'Recibí {msg.data} → publiqué {doble.data}')

rclpy.init()
rclpy.spin(EcoNodo())`,
      },
    },
    labs: [
      { id: "s1l1", l: "Lab A · TurtleSim", s: "Screenshot de ros2 topic list con 5+ tópicos visibles" },
      { id: "s1l2", l: "Lab B · Primer nodo Publisher", s: "Subscriber mostrando mensajes recibidos cada segundo" },
    ],
    videos: [
      { id: "s1v1", l: "Stanford — Intro to Robotics (CS223A)", url: "https://www.youtube.com/watch?v=0yD3uBshJB0" },
      { id: "s1v2", l: "Stanford — Spatial Descriptions & Transforms", url: "https://www.youtube.com/watch?v=QKyDrUonp98" },
      { id: "s1v3", l: "Articulated Robotics — URDF", url: "https://www.youtube.com/watch?v=CwdbsvcpOHM" },
      { id: "s1v4", l: "Articulated Robotics — Gazebo", url: "https://www.youtube.com/watch?v=laWn7_cj434" },
      { id: "s1v5", l: "ROS2 Humble Crash Course (2h50)", url: "https://www.youtube.com/watch?v=Gg25GfA456o" },
    ],
    forts: [
      "Arquitectura de robot (3 capas)",
      "Frames y sistemas de coordenadas",
      "URDF: links y joints",
      "ROS2: nodo + tópico + mensaje",
      "Crear y ejecutar un nodo Python",
      "Usar ros2 node/topic list",
    ],
    defensa: [
      "Explica la diferencia entre un nodo, un tópico y un mensaje en ROS2.",
      "Dibuja el diagrama de frames de un robot móvil sencillo.",
      "¿Por qué usamos quaterniones y no ángulos de Euler en ROS2?",
      "¿Qué información contiene un archivo URDF?",
      "Ejecuta ros2 topic list en tu máquina y explica cada tópico visible.",
      "¿Cuál es la analogía entre un microservicio y un nodo ROS2?",
    ],
  },
  {
    id: "s2",
    tag: "SEM 2/6",
    hours: 12,
    t1: "ROS2 Avanzado",
    t2: "Servicios · acciones · launch files · parámetros · rqt_graph",
    obj: "Dominar servicios, acciones, launch files y parámetros — la comunicación más allá del Pub/Sub.",
    conceptos: [
      { t: "Servicio",    d: "Comunicación síncrona Request/Reply. El cliente bloquea esperando la respuesta." },
      { t: "Acción",      d: "Tarea larga con feedback continuo: Goal → Feedback → Result. No bloquea." },
      { t: "Launch file", d: "Script Python que inicia múltiples nodos con sus parámetros y remapeos." },
      { t: "Parámetro",   d: "Variable de configuración de un nodo, modificable en tiempo real sin reiniciar." },
    ],
    snippet: {
      l: "Llamar un servicio desde código",
      c: `from example_interfaces.srv import AddTwoInts
import rclpy

node = rclpy.create_node('client')
cli = node.create_client(AddTwoInts, 'add_two_ints')
cli.wait_for_service()

req = AddTwoInts.Request()
req.a, req.b = 3, 5

future = cli.call_async(req)
rclpy.spin_until_future_complete(node, future)
print(future.result().sum)  # → 8`,
    },
    topics: [
      "Servicios (Req/Reply)",
      "Acciones (Goal/Feedback/Result)",
      "Launch files",
      "Parámetros dinámicos",
      "rqt_graph",
      "Instalar TurtleBot3",
    ],
    topicDetails: {
      "Servicios (Req/Reply)": {
        desc: "Un servicio ROS2 funciona como una llamada a función remota: el cliente envía un Request y bloquea hasta recibir el Response. Es síncrono y adecuado para operaciones cortas (calibrar, tomar foto, calcular algo). Si la operación tarda segundos, usa una Acción. El tipo de servicio define ambas estructuras en un archivo .srv.",
        codeLabel: "Servidor de servicio mínimo",
        code: `from example_interfaces.srv import AddTwoInts
import rclpy
from rclpy.node import Node

class Sumador(Node):
    def __init__(self):
        super().__init__('sumador')
        self.create_service(AddTwoInts, 'sumar', self.cb)

    def cb(self, req, resp):
        resp.sum = req.a + req.b
        self.get_logger().info(f'{req.a} + {req.b} = {resp.sum}')
        return resp

rclpy.init(); rclpy.spin(Sumador())`,
      },
      "Acciones (Goal/Feedback/Result)": {
        desc: "Las acciones son para tareas largas que necesitan feedback continuo (ir a una posición, grabar un video, explorar un mapa). El cliente envía un Goal, el servidor publica Feedback periódico y al terminar envía un Result. El cliente puede cancelar en cualquier momento. Nav2 usa acciones internamente para toda la navegación.",
        codeLabel: "Cliente de acción con feedback",
        code: `from nav2_msgs.action import NavigateToPose
from rclpy.action import ActionClient
import rclpy

node = rclpy.create_node('nav_client')
client = ActionClient(node, NavigateToPose, 'navigate_to_pose')
client.wait_for_server()

goal = NavigateToPose.Goal()
goal.pose.header.frame_id = 'map'
goal.pose.pose.position.x = 2.0

future = client.send_goal_async(
    goal,
    feedback_callback=lambda fb: print(fb.feedback.distance_remaining)
)`,
      },
      "Launch files": {
        desc: "Un launch file es un script Python que inicia múltiples nodos con sus parámetros, remapeos y namespaces en un solo comando. Permite reusar configuraciones y reproducir setups complejos. Están en el directorio launch/ del paquete y se ejecutan con ros2 launch <paquete> <archivo>.launch.py.",
        codeLabel: "Launch file con dos nodos y parámetros",
        code: `from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='mi_paquete',
            executable='publisher',
            name='pub_nodo',
            parameters=[{'frecuencia': 10.0}],
        ),
        Node(
            package='mi_paquete',
            executable='subscriber',
            name='sub_nodo',
            remappings=[('/entrada', '/salida_pub')],
        ),
    ])`,
      },
      "Parámetros dinámicos": {
        desc: "Los parámetros son variables de configuración de un nodo que pueden leerse y modificarse en tiempo real sin reiniciar el proceso. Se declaran con declare_parameter() en el constructor y se leen con get_parameter(). Con ros2 param set puedes ajustar ganancias, umbrales o cualquier valor de configuración en caliente.",
        codeLabel: "Nodo con parámetro dinámico",
        code: `from rclpy.node import Node
import rclpy

class Configurable(Node):
    def __init__(self):
        super().__init__('configurable')
        self.declare_parameter('velocidad', 1.0)
        self.create_timer(1.0, self.cb)

    def cb(self):
        vel = self.get_parameter('velocidad').value
        self.get_logger().info(f'Velocidad actual: {vel}')

# Cambiar en tiempo real desde terminal:
# ros2 param set /configurable velocidad 2.5`,
      },
      "rqt_graph": {
        desc: "rqt_graph es una herramienta visual que muestra el grafo de nodos y tópicos activos en tu sistema ROS2. Los nodos son óvalos, los tópicos son rectángulos, y las flechas muestran quién publica y quién se suscribe. Es el primer lugar donde mirar cuando algo no funciona: ¿están los nodos corriendo? ¿están conectados?",
        codeLabel: "Cómo lanzar y filtrar el grafo",
        code: `# Lanzar rqt_graph
rqt_graph

# También puedes usar rqt completo y navegar al grafo
rqt

# Para ver sin nodos de rqt en el grafo,
# activa "Hide Debug" en la interfaz

# Alternativa de terminal para ver conexiones:
ros2 topic info /cmd_vel --verbose`,
      },
      "Instalar TurtleBot3": {
        desc: "TurtleBot3 es el robot estándar de referencia para ROS2. El paquete de simulación incluye tres modelos (burger, waffle, waffle_pi) y mundos preconfigurados para Gazebo. Es el banco de pruebas oficial para Nav2 y SLAM. La variable de entorno TURTLEBOT3_MODEL selecciona el modelo activo.",
        codeLabel: "Instalación y primera simulación",
        code: `# Instalar paquetes
sudo apt install ros-humble-turtlebot3*
sudo apt install ros-humble-gazebo-ros-pkgs

# Configurar modelo (agregar a ~/.bashrc)
export TURTLEBOT3_MODEL=burger

# Lanzar simulación en Gazebo
ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py

# Control por teclado (nueva terminal)
ros2 run turtlebot3_teleop teleop_keyboard`,
      },
    },
    labs: [
      { id: "s2l1", l: "Lab A · Servicio que suma dos enteros", s: "Terminal mostrando sum: 8" },
      { id: "s2l2", l: "Lab B · Launch file con 2 nodos", s: "Screenshot de rqt_graph con los nodos conectados" },
    ],
    videos: [
      { id: "s2v1", l: "ROS2 Crash Course — segmento servicios/acciones", url: "https://www.youtube.com/watch?v=Gg25GfA456o" },
      { id: "s2v2", l: "ROS2 Humble For Beginners — playlist", url: "https://www.youtube.com/playlist?list=PLLSegLrePWgJudpPUof4-nVFHGkB62Izy" },
      { id: "s2v3", l: "Combine Publisher + Subscriber + Service", url: "https://www.youtube.com/watch?v=LlRJBtHLzu4" },
      { id: "s2v4", l: "Getting Ready to Build Robots — launch files", url: "https://www.youtube.com/playlist?list=PLunhqkrRNRhYYCaSTVP-qJnyUPkTxJnBt" },
    ],
    forts: [
      "Servicios ROS2 (cliente y servidor)",
      "Acciones ROS2 (goal/feedback/result)",
      "Launch files (múltiples nodos)",
      "Parámetros ROS2 (config dinámica)",
      "rqt_graph (visualizar arquitectura)",
    ],
    defensa: [
      "¿Cuál es la diferencia entre un tópico y un servicio? Da un ejemplo de cada uno.",
      "¿Cuándo usarías una acción en lugar de un servicio?",
      "¿Qué hace el launch file que escribiste? ¿Qué pasaría si quitas un nodo?",
      "Muestra cómo ejecutar un servicio desde el terminal sin escribir código cliente.",
      "Dibuja el grafo de nodos de tu sistema en papel y luego verifica con rqt_graph.",
    ],
  },
  {
    id: "s3",
    tag: "SEM 3/6",
    hours: 11,
    t1: "Transformadas TF2 y Odometría",
    t2: "Frames dinámicos · broadcaster · listener · quaterniones",
    obj: "Comprender cómo el robot sabe dónde está — el problema más fundamental de la robótica móvil.",
    conceptos: [
      { t: "Frame",        d: "Sistema de coordenadas con nombre (world, base_link, camera_link). Son el lenguaje del espacio." },
      { t: "Broadcaster",  d: "Nodo que publica transformadas al árbol TF. Dice 'mi hijo está a X de mí'." },
      { t: "Listener",     d: "Nodo que consulta la posición relativa entre dos frames en cualquier momento." },
      { t: "Quaternion",   d: "Representación de orientación 3D sin gimbal lock: (x, y, z, w). w=1 → sin rotación." },
    ],
    snippet: {
      l: "TF2 Broadcaster (Python)",
      c: `from tf2_ros import TransformBroadcaster
from geometry_msgs.msg import TransformStamped
import rclpy

node = rclpy.create_node('broadcaster')
br = TransformBroadcaster(node)

t = TransformStamped()
t.header.stamp = node.get_clock().now().to_msg()
t.header.frame_id = 'world'
t.child_frame_id = 'base_link'
t.transform.translation.x = 1.0
t.transform.translation.y = 0.5
t.transform.rotation.w = 1.0  # sin rotacion

br.sendTransform(t)`,
    },
    topics: [
      "Sistema TF2",
      "TF2 Broadcaster",
      "TF2 Listener",
      "Quaterniones",
      "Odometría y drift",
      "RViz2 + tf2_tools",
    ],
    topicDetails: {
      "Sistema TF2": {
        desc: "TF2 mantiene un árbol de transformadas entre frames con historial en el tiempo. Cada nodo puede preguntar '¿dónde está el frame X respecto al frame Y hace 0.1 segundos?' sin necesidad de sincronización manual. La relación parent→child se propaga por el árbol automáticamente. El frame raíz suele ser 'map' o 'world'.",
        codeLabel: "Árbol típico de frames de un robot móvil",
        code: `# Jerarquía de frames (de raíz a hoja):
# map
# └── odom
#     └── base_footprint
#         └── base_link
#             ├── base_scan    (LiDAR)
#             ├── camera_link  (cámara)
#             └── imu_link     (IMU)

# Consultar el árbol en tiempo real:
ros2 run tf2_ros tf2_echo map base_link
ros2 run tf2_tools view_frames  # genera frames.pdf`,
      },
      "TF2 Broadcaster": {
        desc: "Un broadcaster publica la posición de un frame hijo respecto a su padre. Cada vez que el robot se mueve, el nodo de odometría usa un broadcaster para actualizar la relación odom→base_link. Los broadcasters estáticos (static_transform_publisher) se usan para frames que nunca cambian, como la posición del LiDAR en el robot.",
        codeLabel: "Broadcaster dinámica en Python",
        code: `from tf2_ros import TransformBroadcaster
from geometry_msgs.msg import TransformStamped
import rclpy

node = rclpy.create_node('mi_broadcaster')
br = TransformBroadcaster(node)

def publicar_tf():
    t = TransformStamped()
    t.header.stamp = node.get_clock().now().to_msg()
    t.header.frame_id = 'odom'       # padre
    t.child_frame_id  = 'base_link'  # hijo
    t.transform.translation.x = 1.5
    t.transform.translation.y = 0.3
    t.transform.rotation.w = 1.0     # sin rotación
    br.sendTransform(t)

node.create_timer(0.05, publicar_tf)  # 20 Hz
rclpy.spin(node)`,
      },
      "TF2 Listener": {
        desc: "Un listener consulta el árbol de TF2 para conocer la posición relativa entre dos frames en un instante de tiempo. Usa un Buffer que almacena el historial de transformadas y un TransformListener que lo alimenta. El método lookup_transform() devuelve la transformada completa (traslación + rotación) entre cualquier par de frames del árbol.",
        codeLabel: "Listener que consulta posición en tiempo real",
        code: `from tf2_ros import Buffer, TransformListener
import rclpy

node = rclpy.create_node('mi_listener')
tf_buffer   = Buffer()
tf_listener = TransformListener(tf_buffer, node)

def consultar():
    try:
        t = tf_buffer.lookup_transform(
            'map',        # frame destino
            'base_link',  # frame origen
            rclpy.time.Time()
        )
        x = t.transform.translation.x
        y = t.transform.translation.y
        node.get_logger().info(f'Robot en map: ({x:.2f}, {y:.2f})')
    except Exception as e:
        node.get_logger().warn(str(e))

node.create_timer(0.5, consultar)
rclpy.spin(node)`,
      },
      "Quaterniones": {
        desc: "En la práctica ROS2, los quaterniones más comunes son: identidad (w=1, sin rotación), 90° en yaw (z=0.707, w=0.707) y 180° en yaw (z=1, w=0). La función quaternion_from_euler(roll, pitch, yaw) de tf_transformations hace la conversión más legible. Recuerda: los ángulos de Euler son intuitivos para escribir, pero los quaterniones son lo que ROS2 usa internamente.",
        codeLabel: "Conversiones prácticas de quaterniones",
        code: `from tf_transformations import (
    quaternion_from_euler,
    euler_from_quaternion
)

# Euler → Quaternión
q = quaternion_from_euler(0, 0, 1.5708)  # yaw 90°
# q = [0.0, 0.0, 0.7071, 0.7071]  → (x, y, z, w)

# Quaternión → Euler
roll, pitch, yaw = euler_from_quaternion([0, 0, 0.707, 0.707])
# yaw ≈ 1.5708 rad = 90°

# Quaterniones comunes:
# Sin rotación:   x=0, y=0, z=0,     w=1
# Yaw 90°:        x=0, y=0, z=0.707, w=0.707
# Yaw 180°:       x=0, y=0, z=1,     w=0`,
      },
      "Odometría y drift": {
        desc: "La odometría calcula la posición del robot integrando las velocidades de las ruedas en el tiempo. El problema es que el error se acumula: pequeños deslizamientos, imprecisiones de encoder o superficies irregulares hacen que la posición estimada diverja de la real con el tiempo. Por eso necesitamos SLAM o AMCL para corregir la odometría con sensores externos (LiDAR, cámara).",
        codeLabel: "Suscribirse a odometría",
        code: `from nav_msgs.msg import Odometry
from tf_transformations import euler_from_quaternion
import rclpy
from rclpy.node import Node

class OdomReader(Node):
    def __init__(self):
        super().__init__('odom_reader')
        self.create_subscription(Odometry, '/odom', self.cb, 10)

    def cb(self, msg):
        x = msg.pose.pose.position.x
        y = msg.pose.pose.position.y
        q = msg.pose.pose.orientation
        _, _, yaw = euler_from_quaternion([q.x, q.y, q.z, q.w])
        self.get_logger().info(f'x={x:.2f} y={y:.2f} yaw={yaw:.2f}')`,
      },
      "RViz2 + tf2_tools": {
        desc: "RViz2 es el visualizador 3D de ROS2. Puedes agregar displays para ver el árbol de TF (TF display), las nubes de puntos del LiDAR, el mapa de SLAM, la trayectoria planificada y más. tf2_tools incluye view_frames que genera un PDF con el árbol completo de frames del sistema, muy útil para debuggear.",
        codeLabel: "Comandos clave de diagnóstico visual",
        code: `# Abrir RViz2
rviz2

# Generar árbol de frames como PDF
ros2 run tf2_tools view_frames
# → genera frames.pdf en el directorio actual

# Ver transformada entre dos frames en tiempo real
ros2 run tf2_ros tf2_echo map base_link

# Diagnosticar si un frame existe
ros2 run tf2_ros tf2_monitor

# En RViz2, agrega estos displays para ver TF:
# Add → TF               (árbol de frames 3D)
# Add → RobotModel       (modelo URDF)
# Add → LaserScan        (datos del LiDAR)`,
      },
    },
    labs: [
      { id: "s3l1", l: "Lab A · Árbol de frames (frames.pdf)", s: "Screenshot del árbol con turtlesim + tf2_echo" },
      { id: "s3l2", l: "Lab B · Tu propio broadcaster en RViz", s: "Frame 'camara' visible 20cm adelante de base_link" },
    ],
    videos: [
      { id: "s3v1", l: "Static and Dynamic Transforms + TF2", url: "https://www.youtube.com/watch?v=hZQWsYAZ58M" },
      { id: "s3v2", l: "TF2 — Coordinate Frame Transform", url: "https://www.youtube.com/watch?v=CraslJJkrcU" },
      { id: "s3v3", l: "TF2 Broadcaster Python", url: "https://www.youtube.com/watch?v=gaEEOettwKg" },
      { id: "s3v4", l: "TF2 Listener Python", url: "https://www.youtube.com/watch?v=zfSJ3LRrCqs" },
      { id: "s3v5", l: "Visualize TFs with RViz and tf2_tools", url: "https://www.youtube.com/watch?v=NuhSdA1G4pM" },
    ],
    forts: [
      "Árbol de frames TF2 (parent/child)",
      "TF2 Broadcaster en Python",
      "TF2 Listener en Python",
      "Quaterniones (uso práctico)",
      "Odometría y sus limitaciones",
      "Visualizar frames en RViz2",
    ],
    defensa: [
      "¿Qué es un frame y cómo se relacionan en el árbol de TF2?",
      "¿Cuál es la diferencia entre un broadcaster y un listener?",
      "¿Por qué el quaternion [0, 0, 0.707, 0.707] representa 90° de yaw?",
      "¿Por qué la odometría acumula error con el tiempo?",
      "Ejecuta tf2_echo y explica el output que ves.",
    ],
  },
  {
    id: "s4",
    tag: "SEM 4/6",
    hours: 11,
    t1: "Control de Movimiento y PID",
    t2: "Controlador PID · cmd_vel · TurtleBot3 en Gazebo · trayectorias",
    obj: "Hacer que el robot se mueva de forma controlada con controladores PID y comandos de velocidad.",
    conceptos: [
      { t: "PID",     d: "Proporcional-Integral-Derivativo. Cada componente corrige un aspecto distinto del error." },
      { t: "Twist",   d: "Mensaje de velocidad: linear.x (avanzar/retroceder), angular.z (girar). Simplifica el control." },
      { t: "cmd_vel", d: "Tópico estándar para comandos de velocidad. Cualquier robot diferencial lo entiende." },
      { t: "Error",   d: "Diferencia entre posición deseada y actual. El PID trabaja para llevarlo a cero." },
    ],
    snippet: {
      l: "Controlador PID básico (Python)",
      c: `from geometry_msgs.msg import Twist

Kp, Ki, Kd = 1.0, 0.05, 0.02
integral = prev_error = 0.0

def pid_step(target, current, dt):
    global integral, prev_error
    error      = target - current
    integral  += error * dt
    derivative = (error - prev_error) / dt
    prev_error = error
    return Kp * error + Ki * integral + Kd * derivative

# En el callback de odometría:
vel = Twist()
vel.linear.x = pid_step(1.0, odom_x, 0.1)
cmd_vel_pub.publish(vel)`,
    },
    topics: [
      "Teoría PID (P, I, D)",
      "Mensajes Twist",
      "PID en Python",
      "Sintonizar Kp/Ki/Kd",
      "TurtleBot3 en Gazebo",
      "Seguimiento de trayectoria",
    ],
    topicDetails: {
      "Teoría PID (P, I, D)": {
        desc: "P (Proporcional) reacciona al error actual: grande → corrección grande. I (Integral) suma el error acumulado: corrige el error estacionario que P no alcanza a eliminar. D (Derivativo) frena cuando el error está cambiando rápido: evita la oscilación. Un PID bien sintonizado llega al objetivo suave y rápido sin rebotar.",
        codeLabel: "Efecto de cada componente",
        code: `# Solo P: llega cerca pero oscila o tiene error residual
# Solo PI: elimina error residual pero puede oscilar más
# PID completo: rápido, sin error residual, sin oscilación

# Error estacionario — ejemplo:
# Robot debe ir a x=1.0m
# Con solo P (Kp=1): llega a x=0.95 y se queda → error 0.05
# Con PI: el integrador acumula el 0.05 hasta corregirlo

# Señal de control típica:
u = Kp*e + Ki*∫e·dt + Kd*(de/dt)
# donde e = posición_deseada - posición_actual`,
      },
      "Mensajes Twist": {
        desc: "geometry_msgs/Twist es el mensaje estándar para controlar la velocidad de un robot. linear.x es la velocidad hacia adelante (m/s) y angular.z es la velocidad de giro (rad/s). Para un robot diferencial (2 ruedas) estos dos valores son suficientes. El tópico /cmd_vel es el estándar universal — TurtleSim, TurtleBot3 y el Go2 lo entienden.",
        codeLabel: "Publicar Twist para moverse en círculo",
        code: `from geometry_msgs.msg import Twist
import rclpy
from rclpy.node import Node

class Circulo(Node):
    def __init__(self):
        super().__init__('circulo')
        self.pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.create_timer(0.1, self.cb)

    def cb(self):
        msg = Twist()
        msg.linear.x  = 0.3   # m/s adelante
        msg.angular.z = 0.5   # rad/s giro
        self.pub.publish(msg)  # → describe un círculo

rclpy.init(); rclpy.spin(Circulo())`,
      },
      "PID en Python": {
        desc: "Implementar un PID en Python es directo: necesitas guardar el error anterior (para la derivada) y el integrador acumulado. La clave es el timestep dt — si no lo controlas, el comportamiento cambia con la carga del sistema. Usa create_timer() de ROS2 para garantizar un dt constante y multiplica el Kd por la frecuencia si dt es fijo.",
        codeLabel: "Clase PID reutilizable",
        code: `class PID:
    def __init__(self, kp, ki, kd, dt):
        self.kp, self.ki, self.kd = kp, ki, kd
        self.dt = dt
        self.integral = 0.0
        self.prev_error = 0.0

    def step(self, target, current):
        error         = target - current
        self.integral += error * self.dt
        derivative    = (error - self.prev_error) / self.dt
        self.prev_error = error
        return self.kp*error + self.ki*self.integral + self.kd*derivative

    def reset(self):
        self.integral = self.prev_error = 0.0

# Uso: pid = PID(1.0, 0.05, 0.02, dt=0.1)
#      vel.linear.x = pid.step(target_x, current_x)`,
      },
      "Sintonizar Kp/Ki/Kd": {
        desc: "El método empírico más simple: empieza con Ki=Kd=0 y sube Kp hasta que el robot oscile, luego bájalo a la mitad. Agrega Kd para frenar la oscilación, luego Ki para eliminar el error residual. Un Kp demasiado alto causa oscilación inestable; Ki alto causa 'wind-up' (el integrador explota); Kd alto amplifica el ruido de la señal.",
        codeLabel: "Guía de sintonización práctica",
        code: `# Paso 1: Solo P — sube Kp hasta que oscile
Kp = 0.5  → sub-amortiguado (lento)
Kp = 2.0  → crítico (ideal)
Kp = 5.0  → oscila → DEMASIADO

# Paso 2: Agrega D para frenar la oscilación
Kd = 0.1  → reduce sobreimpulso

# Paso 3: Agrega I para eliminar error residual
Ki = 0.02 → elimina el último 5% de error

# Anti wind-up: limita el integrador
self.integral = max(-10, min(10, self.integral))`,
      },
      "TurtleBot3 en Gazebo": {
        desc: "TurtleBot3 en Gazebo es el setup de simulación más usado en los tutoriales de ROS2. El paquete incluye mundos preconfigurados (empty, turtlebot3_world, turtlebot3_house) y el robot con LiDAR, IMU y encoders simulados. Una vez lanzado, los tópicos /odom, /scan y /cmd_vel se comportan exactamente igual que en el robot real.",
        codeLabel: "Lanzar TurtleBot3 y verificar sensores",
        code: `# Configurar modelo (solo una vez, en ~/.bashrc)
export TURTLEBOT3_MODEL=burger
source ~/.bashrc

# Lanzar simulación
ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py

# Verificar que los tópicos estén activos
ros2 topic list
# → /odom, /scan, /cmd_vel, /joint_states, /tf ...

# Ver el LiDAR en tiempo real
ros2 topic echo /scan --no-arr  # muestra ranges sin array completo

# Teleoperación
ros2 run turtlebot3_teleop teleop_keyboard`,
      },
      "Seguimiento de trayectoria": {
        desc: "Seguir una trayectoria significa que el robot debe pasar por una secuencia de puntos (waypoints) en orden. La estrategia más simple es dirigirse al siguiente waypoint con un controlador PID de posición y ángulo. Cuando llega dentro de un radio de tolerancia (ej. 0.1m), avanza al siguiente. Nav2 usa este concepto pero con algoritmos más sofisticados.",
        codeLabel: "Seguidor simple de waypoints",
        code: `import math

waypoints = [(0,0), (2,0), (2,2), (0,2)]
idx = 0
tolerancia = 0.15  # metros

def seguir(odom_x, odom_y, odom_yaw):
    global idx
    if idx >= len(waypoints): return Twist()  # llegó al final

    gx, gy = waypoints[idx]
    dist = math.sqrt((gx-odom_x)**2 + (gy-odom_y)**2)

    if dist < tolerancia:
        idx += 1  # siguiente waypoint
        return Twist()

    angulo_meta = math.atan2(gy-odom_y, gx-odom_x)
    error_yaw   = angulo_meta - odom_yaw
    # Normalizar a [-π, π]
    error_yaw = math.atan2(math.sin(error_yaw), math.cos(error_yaw))

    vel = Twist()
    vel.linear.x  = min(0.3, 0.5 * dist)
    vel.angular.z = 1.5 * error_yaw
    return vel`,
      },
    },
    labs: [
      { id: "s4l1", l: "Lab A · Mover TurtleBot3 con cmd_vel", s: "Screenshot de Gazebo con TurtleBot3 visible" },
      { id: "s4l2", l: "Lab B · PID que avanza exactamente 1m", s: "Experimenta con kp 0.5 / 1.5 / 3.0 y documenta" },
    ],
    videos: [
      { id: "s4v1", l: "Mobile Robotics Part 2 — PID (MATLAB)", url: "https://www.youtube.com/watch?v=uxb6wI9JWBU" },
      { id: "s4v2", l: "Brian Douglas — Control Systems", url: "https://www.youtube.com/channel/UCq0imsn84ShAe9PBOFnoIrg" },
      { id: "s4v3", l: "ROS2 Navigation & SLAM — TurtleBot3", url: "https://www.youtube.com/watch?v=C0MM389Xql0" },
      { id: "s4v4", l: "The ROS Transform System (repaso TF)", url: "https://www.youtube.com/watch?v=QyvHhY4Y_Y8" },
    ],
    forts: [
      "Teoría PID: P, I, D y sus efectos",
      "Implementar PID en Python",
      "Mensaje Twist y tópico /cmd_vel",
      "Sintonización de ganancias",
      "Leer odometría como feedback",
      "Simular TurtleBot3 en Gazebo",
    ],
    defensa: [
      "¿Qué pasa si aumentas mucho el Kp? ¿Y si lo bajas demasiado?",
      "¿Para qué sirve el componente I del PID? Da un ejemplo concreto.",
      "¿Por qué el mensaje Twist usa linear.x y angular.z para un robot diferencial?",
      "¿Cuál fue el efecto de cambiar el Kp en tu simulación?",
      "¿Cómo usas la odometría como feedback para el controlador?",
    ],
  },
  {
    id: "s5",
    tag: "SEM 5/6",
    hours: 10,
    t1: "Navegación Autónoma · Nav2 y SLAM",
    t2: "Nav2 Stack · SLAM Toolbox · mapas · TurtleBot3 autónomo",
    obj: "El laboratorio más complejo del curso — mapear un entorno con SLAM y luego navegarlo de forma autónoma con Nav2.",
    conceptos: [
      { t: "SLAM",     d: "Simultaneous Localization And Mapping: el robot construye el mapa mientras se localiza en él." },
      { t: "Costmap",  d: "Mapa de costos: obstáculos tienen costo alto, pasillos libre bajo. El planner busca el mínimo costo." },
      { t: "Nav2",     d: "Stack de navegación de ROS2: planifica rutas globales y las ejecuta con control local." },
      { t: "AMCL",     d: "Adaptive Monte Carlo Localization: localiza al robot en un mapa guardado usando partículas." },
    ],
    snippet: {
      l: "Enviar goal de navegación (Python)",
      c: `from nav2_simple_commander.robot_navigator import BasicNavigator
from geometry_msgs.msg import PoseStamped

nav = BasicNavigator()
nav.waitUntilNav2Active()

goal = PoseStamped()
goal.header.frame_id = 'map'
goal.pose.position.x = 2.0
goal.pose.position.y = 1.5
goal.pose.orientation.w = 1.0

nav.goToPose(goal)
while not nav.isTaskComplete():
    feedback = nav.getFeedback()
    # distancia restante: feedback.distance_remaining`,
    },
    topics: [
      "Stack de Nav2",
      "SLAM",
      "slam_toolbox",
      "Navegar con mapa guardado",
      "Costmaps",
      "Planificadores de ruta",
    ],
    topicDetails: {
      "Stack de Nav2": {
        desc: "Nav2 es el stack de navegación de ROS2, compuesto por varios servidores de acción coordinados por un Behavior Tree. Los componentes principales son: map_server (carga el mapa), amcl (localización), planner_server (ruta global), controller_server (ruta local), behavior_server (recuperación) y bt_navigator (orquestador). Todos se lanzan juntos con nav2_bringup.",
        codeLabel: "Arquitectura de Nav2 simplificada",
        code: `# Flujo de una petición de navegación:
# 1. Usuario envía PoseStamped al BT Navigator
# 2. BT Navigator llama al Planner Server
# 3. Planner Server (NavFn) calcula ruta global en el costmap
# 4. BT Navigator llama al Controller Server
# 5. Controller Server (DWB) genera cmd_vel para seguir la ruta
# 6. Si el robot se atasca → Behavior Server ejecuta recuperación

# Lanzar Nav2 completo en simulación:
ros2 launch nav2_bringup navigation_launch.py \
  use_sim_time:=true \
  map:=/path/to/mapa.yaml`,
      },
      "SLAM": {
        desc: "SLAM (Simultaneous Localization And Mapping) es el problema de construir un mapa de un entorno desconocido mientras el robot se localiza en ese mismo mapa — un problema circular porque necesitas el mapa para localizarte, y necesitas localizarte para construir el mapa. Se resuelve con filtros probabilísticos que estiman ambas cosas a la vez usando los datos del LiDAR.",
        codeLabel: "Iniciar SLAM y guardar el mapa",
        code: `# Terminal 1: lanzar simulación
ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py

# Terminal 2: iniciar SLAM
ros2 launch slam_toolbox online_async_launch.py \
  use_sim_time:=true

# Terminal 3: visualizar en RViz2
rviz2 -d $(ros2 pkg prefix nav2_bringup)/share/nav2_bringup/rviz/nav2_default_view.rviz

# Terminal 4: teleoperar para mapear
ros2 run turtlebot3_teleop teleop_keyboard

# Cuando el mapa esté listo, guardarlo:
ros2 run nav2_map_server map_saver_cli -f ~/mapa`,
      },
      "slam_toolbox": {
        desc: "slam_toolbox es la implementación de SLAM más usada en ROS2. Tiene tres modos: online_async (en tiempo real mientras mapeas), offline (procesa un bag grabado), y localization (solo localización en un mapa ya guardado). El modo async es el más común: corre en un hilo separado sin bloquear los otros nodos. Genera archivos .pgm (imagen) y .yaml (metadatos del mapa).",
        codeLabel: "Modos de slam_toolbox",
        code: `# Modo 1: Mapeo en tiempo real (el más común)
ros2 launch slam_toolbox online_async_launch.py use_sim_time:=true

# Modo 2: Solo localización (mapa ya existe)
ros2 launch slam_toolbox localization_launch.py \
  map:=/home/user/mapa.yaml use_sim_time:=true

# El mapa se guarda como dos archivos:
# mapa.pgm  → imagen PNG del mapa (blanco=libre, negro=obstáculo)
# mapa.yaml → metadatos: resolución (m/px), origen, umbrales
# resolution: 0.05  # 5 cm por píxel
# origin: [-1.5, -1.5, 0.0]`,
      },
      "Navegar con mapa guardado": {
        desc: "Para navegar con un mapa guardado necesitas: 1) map_server que cargue el archivo .yaml, 2) AMCL para localizarse en ese mapa usando el LiDAR, y 3) Nav2 para planificar y ejecutar rutas. El paso crítico es dar la 'Initial Pose' (posición inicial del robot en el mapa) antes de empezar — sin esto, AMCL no sabe dónde empezar a buscar.",
        codeLabel: "Flujo completo de navegación con mapa",
        code: `# Terminal 1: simulación + Nav2 + mapa guardado
ros2 launch turtlebot3_navigation2 navigation2.launch.py \
  use_sim_time:=true \
  map:=/home/user/mapa.yaml

# En RViz2:
# 1. Clic en "2D Pose Estimate" → clic en el mapa donde está el robot
# 2. Clic en "Nav2 Goal" → clic en el destino

# Desde código Python:
from nav2_simple_commander.robot_navigator import BasicNavigator
nav = BasicNavigator()
nav.setInitialPose(initial_pose)  # PoseStamped en frame 'map'
nav.waitUntilNav2Active()
nav.goToPose(goal_pose)`,
      },
      "Costmaps": {
        desc: "Un costmap asigna un costo (0=libre, 254=obstáculo, valores intermedios=cerca de obstáculo) a cada celda del mapa. Nav2 usa dos costmaps: el global (mapa completo para planificar la ruta) y el local (ventana alrededor del robot para evitar obstáculos en tiempo real). La inflation_layer expande los obstáculos para que el planner mantenga distancia de seguridad.",
        codeLabel: "Capas del costmap (conceptual)",
        code: `# Costmap global:
# - Tamaño: todo el mapa
# - Se actualiza lento
# - Usa: mapa estático + inflation layer
# → genera la ruta A→B evitando paredes

# Costmap local:
# - Tamaño: ventana (ej. 3m × 3m) alrededor del robot
# - Se actualiza a 10Hz con datos del LiDAR en tiempo real
# - Usa: obstacle layer + inflation layer
# → evita obstáculos dinámicos no en el mapa

# Inflation layer: expande obstáculos por un radio
# inflation_radius: 0.55  # metros (mayor que radio del robot)
# cost_scaling_factor: 10.0  # qué tan rápido baja el costo`,
      },
      "Planificadores de ruta": {
        desc: "Nav2 usa dos planificadores separados: el global (NavFn o Smac) que calcula la ruta óptima de principio a fin en el costmap global, y el local (DWB o MPPI) que genera comandos de velocidad suaves para seguir esa ruta mientras evita obstáculos en el costmap local. El global se ejecuta una vez; el local se ejecuta a 10–20Hz durante toda la navegación.",
        codeLabel: "Configurar planificadores en Nav2",
        code: `# nav2_params.yaml (fragmento)
planner_server:
  ros__parameters:
    planner_plugins: ["GridBased"]
    GridBased:
      plugin: "nav2_navfn_planner/NavfnPlanner"
      tolerance: 0.5
      use_astar: false  # true = A*, false = Dijkstra

controller_server:
  ros__parameters:
    controller_plugins: ["FollowPath"]
    FollowPath:
      plugin: "dwb_core::DWBLocalPlanner"
      max_vel_x: 0.26
      max_rot_vel: 1.82
      # DWB evalúa ~200 trayectorias y elige la de menor costo`,
      },
    },
    labs: [
      { id: "s5l1", l: "Lab A · Generar un mapa con SLAM", s: "Mapa en RViz2 + archivos .pgm y .yaml guardados" },
      { id: "s5l2", l: "Lab B · Navegación autónoma punto a punto", s: "RViz2 mostrando la ruta planificada y el robot navegando" },
    ],
    videos: [
      { id: "s5v1", l: "Nav2 — Generate a Map with slam_toolbox", url: "https://www.youtube.com/watch?v=hMTxb8Y2cxI" },
      { id: "s5v2", l: "Nav2 Tutorial para TurtleBot3", url: "https://www.youtube.com/watch?v=6CO58W3i1h8" },
      { id: "s5v3", l: "ROS2 Navigation & SLAM — TurtleBot3 sim", url: "https://www.youtube.com/watch?v=C0MM389Xql0" },
      { id: "s5v4", l: "ROS2 SLAM Toolbox Tutorial", url: "https://www.youtube.com/watch?v=0G6LDuslqmA" },
      { id: "s5v5", l: "TurtleBot3 SLAM and Autonomous Navigation", url: "https://www.youtube.com/watch?v=-4Ewuhfgbx8" },
    ],
    forts: [
      "Arquitectura de Nav2",
      "SLAM: mapear y localizar",
      "Generar mapa con slam_toolbox",
      "Navegar autónomamente con Nav2",
      "Costmaps (global y local)",
      "Enviar objetivos de navegación",
    ],
    defensa: [
      "Explica qué es SLAM en tus propias palabras. ¿Por qué es un problema 'circular'?",
      "¿Qué componente de Nav2 calcula la ruta? ¿Cuál la sigue?",
      "¿Qué es un costmap y por qué tiene dos capas (global y local)?",
      "¿Por qué el robot necesita el 'Initial Pose' antes de navegar con un mapa guardado?",
      "¿Qué diferencia hay entre SLAM (mapear) y AMCL (localizarse)?",
    ],
  },
  {
    id: "s6",
    tag: "SEM 6/6",
    hours: 10,
    t1: "Proyecto Capstone",
    t2: "Integra todo en un sistema robótico autónomo completo",
    obj: "Integrar todo lo aprendido en un sistema robótico autónomo completo, documentado y presentable.",
    conceptos: [
      { t: "Waypoint",       d: "Punto de navegación en el mapa. El robot los recorre en secuencia con followWaypoints()." },
      { t: "Lifecycle node", d: "Nodo con estados explícitos (configure → activate → deactivate) para control fino del sistema." },
      { t: "rqt_graph",      d: "Herramienta visual que muestra todos los nodos y tópicos activos. El mapa de tu sistema." },
      { t: "Frontier SLAM",  d: "Estrategia de exploración autónoma: el robot navega hacia los límites del mapa desconocido." },
    ],
    snippet: {
      l: "Patrullero multi-waypoint (Nav2)",
      c: `from nav2_simple_commander.robot_navigator import BasicNavigator
from geometry_msgs.msg import PoseStamped

nav = BasicNavigator()
nav.waitUntilNav2Active()

waypoints_xy = [(0.0, 0.0), (2.0, 0.0), (2.0, 2.0), (0.0, 2.0)]

def make_pose(x, y):
    p = PoseStamped()
    p.header.frame_id = 'map'
    p.pose.position.x = x
    p.pose.position.y = y
    p.pose.orientation.w = 1.0
    return p

poses = [make_pose(x, y) for x, y in waypoints_xy]

while True:  # patrulla infinita
    nav.followWaypoints(poses)
    while not nav.isTaskComplete():
        pass`,
    },
    topics: [
      "Diseñar arquitectura",
      "Integrar control + localización + nav",
      "Debugging del sistema",
      "Documentar (README, docstrings)",
      "GitHub con commits limpios",
      "Presentación técnica (15 min)",
    ],
    topicDetails: {
      "Diseñar arquitectura": {
        desc: "Una buena arquitectura de nodos separa responsabilidades: un nodo lee sensores, otro hace planeación, otro controla actuadores. Cada nodo tiene una sola razón para cambiar. Define los tópicos como contrato entre nodos — su tipo y nombre no deben cambiar aunque la implementación interna sí. Dibuja el grafo en papel antes de escribir código.",
        codeLabel: "Plantilla de arquitectura para el capstone",
        code: `# Arquitectura recomendada para el capstone:
#
#  /scan (LiDAR)     ──→  [obstacle_detector]  ──→  /obstacles
#  /odom             ──→  [mission_manager]     ──→  /goal_pose
#  /map              ──→       ↓
#                       [nav2_stack]           ──→  /cmd_vel
#
# Nodos propios:
#  obstacle_detector:  suscribe /scan, publica /obstacles
#  mission_manager:    suscribe /odom + /obstacles, publica goals a Nav2
#
# Regla: si un nodo tiene >3 responsabilidades, divídelo`,
      },
      "Integrar control + localización + nav": {
        desc: "La integración es donde más errores ocurren. Las causas más comunes son: frames inconsistentes (publicar en 'odom' cuando deberías en 'map'), tiempos desincronizados (use_sim_time no activado), QoS incompatibles entre publisher y subscriber, y parámetros por defecto que no aplican a tu robot. Verifica cada conexión con ros2 topic info y rqt_graph.",
        codeLabel: "Checklist de integración",
        code: `# 1. Verificar que todos los frames existan
ros2 run tf2_tools view_frames

# 2. Verificar que los tópicos tengan publishers
ros2 topic info /cmd_vel
ros2 topic hz /odom  # ¿llegan datos?

# 3. Verificar QoS (debe coincidir entre pub y sub)
ros2 topic info /scan --verbose

# 4. En simulación: asegurarse de use_sim_time
ros2 param get /mi_nodo use_sim_time

# 5. Ver logs de error
ros2 topic echo /rosout  # logs de todos los nodos`,
      },
      "Debugging del sistema": {
        desc: "El debugging en ROS2 tiene un toolkit definido: rqt_graph para ver la topología, tf2_echo para verificar transformadas, ros2 topic echo para ver datos en vivo, ros2 doctor para diagnosticar problemas del sistema. El 80% de los bugs son: frame_id incorrecto, tópico no publicado, QoS incompatible, o parámetro mal configurado.",
        codeLabel: "Comandos de debugging más útiles",
        code: `# Ver arquitectura completa del sistema
rqt_graph

# Verificar un tópico
ros2 topic echo /cmd_vel           # ver mensajes
ros2 topic hz /odom                # frecuencia
ros2 topic info /scan --verbose    # publishers, subscribers, QoS

# Verificar frames
ros2 run tf2_tools view_frames
ros2 run tf2_ros tf2_echo map base_link

# Ver logs en tiempo real
ros2 topic echo /rosout

# Diagnóstico general del sistema
ros2 doctor

# Ver qué está fallando en Nav2
ros2 lifecycle list  # estado de los nodos lifecycle`,
      },
      "Documentar (README, docstrings)": {
        desc: "Un buen README tiene: qué hace el proyecto (1 párrafo), cómo instalarlo (comandos exactos), cómo ejecutarlo (con los argumentos), y qué hace cada nodo. Los docstrings en Python deben explicar el propósito del nodo y sus parámetros configurables. La documentación no es opcional — en robótica, el robot puede cambiar de manos o volverte a tomar en 6 meses.",
        codeLabel: "Plantilla de docstring para nodos ROS2",
        code: `class PatrulleroNode(Node):
    """
    Navega entre waypoints en secuencia usando Nav2.

    Parámetros ROS2:
        waypoints (list): Lista de [x, y] en frame 'map'.
        loop (bool): Si True, repite el ciclo indefinidamente.
        goal_tolerance (float): Radio de llegada en metros.

    Suscripciones:
        /odom (nav_msgs/Odometry): Posición actual del robot.

    Publicaciones (a Nav2):
        Manda goals via ActionClient a /navigate_to_pose.

    Uso:
        ros2 run mi_paquete patrullero --ros-args \
            -p loop:=true
    """`,
      },
      "GitHub con commits limpios": {
        desc: "Un historial de commits limpio muestra tu proceso de trabajo y facilita el debugging cuando algo se rompe. Cada commit debe hacer una sola cosa y tener un mensaje que explique el porqué (no el qué). La estructura del repositorio debe seguir la convención de paquetes ROS2: un directorio por paquete, cada uno con package.xml y setup.py.",
        codeLabel: "Estructura de repo y mensajes de commit",
        code: `# Estructura recomendada del repositorio:
capstone_ws/
├── src/
│   ├── detector_pkg/
│   │   ├── package.xml
│   │   ├── setup.py
│   │   └── detector_pkg/obstacle_detector.py
│   └── mission_pkg/
│       ├── package.xml
│       ├── setup.py
│       └── mission_pkg/mission_manager.py
└── README.md

# Mensajes de commit claros:
git commit -m "Agregar controlador PID para seguimiento de waypoints"
git commit -m "Corregir frame_id incorrecto en el broadcaster de odometría"
git commit -m "Configurar Nav2 para el mapa del laboratorio 3"`,
      },
      "Presentación técnica (15 min)": {
        desc: "Una presentación técnica de 15 minutos tiene esta estructura: 2 min (el problema que resuelves), 5 min (demo en vivo o video), 5 min (arquitectura del sistema con rqt_graph), 3 min (qué aprendiste y qué mejorarías). Anticipa preguntas sobre tus decisiones de diseño: '¿Por qué usaste Nav2 y no tu propio controlador?', '¿Qué pasaría si el mapa cambia?'.",
        codeLabel: "Guión sugerido de 15 minutos",
        code: `# ── MINUTO 0–2: El problema ──
"Quería que el robot patrullara 4 puntos del lab sin
 intervención humana. Esto requería: localización,
 planificación y control."

# ── MINUTO 2–7: Demo en vivo ──
# Lanzar simulación → dar Initial Pose → dejar correr

# ── MINUTO 7–12: Arquitectura ──
# Mostrar rqt_graph
# Explicar cada nodo: "Este lee el LiDAR, este decide..."
# Mostrar el código del nodo más importante (30 líneas max)

# ── MINUTO 12–15: Reflexión ──
"Lo más difícil fue sintonizar Nav2 para mi mapa.
 Si lo rehago, separaría el detector de obstáculos
 en su propio nodo desde el inicio."`,
      },
    },
    labs: [
      { id: "s6l1", l: "Proyecto A · Patrullero autónomo", s: "Recorre waypoints A→B→C→A con Nav2 indefinidamente" },
      { id: "s6l2", l: "Proyecto B · Mapea y navega solo", s: "Exploración autónoma (frontier) + SLAM + Nav2" },
      { id: "s6l3", l: "Proyecto C · Seguidor de corredor", s: "PID lateral con LiDAR, sin mapas ni Nav2" },
      { id: "s6e1", l: "Entregable · Código en GitHub (30%)", s: "Repo público, commits limpios, README completo" },
      { id: "s6e2", l: "Entregable · Video de demo (25%)", s: "2-3 min de la simulación funcionando, con voz" },
      { id: "s6e3", l: "Entregable · Documento técnico (20%)", s: "Arquitectura, decisiones de diseño, qué aprendiste" },
      { id: "s6e4", l: "Entregable · Presentación (25%)", s: "15 min: explica el sistema y responde preguntas" },
    ],
    videos: [
      { id: "s6v1", l: "Repaso de videos de semanas anteriores" },
      { id: "s6v2", l: "Documentación oficial Nav2", url: "https://navigation.ros.org/" },
      { id: "s6v3", l: "Documentación oficial ROS2", url: "https://docs.ros.org/en/humble/" },
    ],
    forts: [
      "Diseñar arquitectura de nodos",
      "Integrar todo el sistema",
      "Debugging completo (rqt_graph, tf2_tools)",
      "Documentar y versionar en GitHub",
      "Dar una presentación técnica",
    ],
    defensa: [
      "Explica el flujo completo de tu sistema: qué datos leen los nodos, qué publican, cómo se comunican.",
      "Si el robot no llega al destino, ¿qué herramientas usas para diagnosticar el problema?",
      "¿Qué aprendiste de robótica que no sabías antes de empezar el curso?",
      "¿Qué cambiarías en tu arquitectura si tuvieras que hacerlo de nuevo?",
      "¿Cómo escalarías este sistema para funcionar en un robot real (no simulado)?",
    ],
  },
];

const COMMANDS = [
  {
    group: "Nodos y tópicos",
    cmds: [
      { c: "ros2 run <pkg> <exec>",                         d: "Ejecutar un nodo" },
      { c: "ros2 node list",                                d: "Listar nodos activos" },
      { c: "ros2 node info <node>",                         d: "Suscripciones y publicaciones del nodo" },
      { c: "ros2 topic list",                               d: "Listar todos los tópicos" },
      { c: "ros2 topic echo <topic>",                       d: "Ver mensajes en tiempo real" },
      { c: "ros2 topic pub <topic> <type> '{data}'",        d: "Publicar un mensaje manualmente" },
      { c: "ros2 topic hz <topic>",                         d: "Frecuencia de publicación (Hz)" },
    ],
  },
  {
    group: "Servicios y acciones",
    cmds: [
      { c: "ros2 service list",                             d: "Listar servicios disponibles" },
      { c: "ros2 service call <srv> <type> '{args}'",       d: "Llamar un servicio desde terminal" },
      { c: "ros2 service type <srv>",                       d: "Ver el tipo de un servicio" },
      { c: "ros2 action list",                              d: "Listar acciones disponibles" },
      { c: "ros2 action send_goal <action> <type> '{}'",    d: "Enviar goal a una acción" },
    ],
  },
  {
    group: "TF2",
    cmds: [
      { c: "ros2 run tf2_ros tf2_echo <from> <to>",                                                                       d: "Transformada en tiempo real entre dos frames" },
      { c: "ros2 run tf2_tools view_frames",                                                                               d: "Generar árbol de frames en frames.pdf" },
      { c: "ros2 run tf2_ros static_transform_publisher --x 0 --y 0 --z 0 --frame-id world --child-frame-id base_link",   d: "Publicar transformada estática" },
    ],
  },
  {
    group: "Launch y parámetros",
    cmds: [
      { c: "ros2 launch <pkg> <file>.launch.py",            d: "Ejecutar un launch file" },
      { c: "ros2 param list",                               d: "Listar parámetros de todos los nodos" },
      { c: "ros2 param get <node> <param>",                 d: "Leer un parámetro" },
      { c: "ros2 param set <node> <param> <val>",           d: "Cambiar un parámetro en tiempo real" },
    ],
  },
  {
    group: "SLAM y Nav2",
    cmds: [
      { c: "ros2 launch slam_toolbox online_async_launch.py",                      d: "Iniciar SLAM asíncrono" },
      { c: "ros2 run nav2_map_server map_saver_cli -f <name>",                     d: "Guardar mapa (.pgm + .yaml)" },
      { c: "ros2 launch nav2_bringup navigation_launch.py use_sim_time:=true",     d: "Iniciar stack Nav2 en simulación" },
    ],
  },
  {
    group: "Workspace",
    cmds: [
      { c: "colcon build --symlink-install",                        d: "Compilar workspace (links simbólicos)" },
      { c: "source install/setup.bash",                             d: "Activar workspace compilado" },
      { c: "colcon build --packages-select <pkg>",                  d: "Compilar solo un paquete" },
      { c: "ros2 pkg create --build-type ament_python <pkg>",       d: "Crear paquete Python nuevo" },
    ],
  },
];

const FINAL = [
  {
    w: "S1",
    items: [
      { id: "f_s1a", l: "URDF de un robot cargado en RViz2" },
      { id: "f_s1b", l: "Nodo Python Publisher + Subscriber" },
    ],
  },
  {
    w: "S2",
    items: [
      { id: "f_s2a", l: "Servicio ROS2 con cliente y servidor" },
      { id: "f_s2b", l: "Launch file con 2+ nodos + rqt_graph" },
    ],
  },
  {
    w: "S3",
    items: [
      { id: "f_s3a", l: "TF2 broadcaster + listener en Python" },
      { id: "f_s3b", l: "Árbol de frames visible en tf2_tools" },
    ],
  },
  {
    w: "S4",
    items: [
      { id: "f_s4a", l: "TurtleBot3 corriendo en Gazebo" },
      { id: "f_s4b", l: "PID que detiene el robot a 1m" },
    ],
  },
  {
    w: "S5",
    items: [
      { id: "f_s5a", l: "Mapa generado con SLAM y guardado" },
      { id: "f_s5b", l: "Navegación autónoma punto a punto" },
    ],
  },
  {
    w: "S6",
    items: [
      { id: "f_s6a", l: "Proyecto capstone en simulación" },
      { id: "f_s6b", l: "Código en GitHub con README" },
      { id: "f_s6c", l: "Video de demo grabado" },
      { id: "f_s6d", l: "Presentación completada" },
    ],
  },
];
