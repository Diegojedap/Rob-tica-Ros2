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
