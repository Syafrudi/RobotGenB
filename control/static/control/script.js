// HiveMQ Cloud Configuration
// PERINGATAN KEAMANAN: Untuk aplikasi produksi, jangan letakkan kredensial di kode frontend.
// Pertimbangkan untuk menggunakan token sementara yang di-generate oleh backend Django.
const MQTT_CONFIG = {
  broker: 'wss://e8600f280ce3482996633b26e5c91eff.s1.eu.hivemq.cloud:8884/mqtt',
  username: 'esp32',
  password: 'Babacang2824',
  clientId: 'robot_control_' + Math.random().toString(16).substr(2, 8),
  topic: 'robot/control'
};

// Global Variables
let mqttClient = null;
let isConnected = false;
let autoMode = false;
let pumpActive = false;
let currentCommand = 0;

// Command Codes
const COMMANDS = {
  STOP: 0,
  FORWARD: 1,
  BACKWARD: 2,
  LEFT: 3,
  RIGHT: 4,
  PUMP_OFF: 5,
  PUMP_ON: 6,
  AUTO_ON: 7,
  AUTO_OFF: 8
};

// DOM Elements
const elements = {
  connectionStatus: document.getElementById('connectionStatus'),
  statusText: document.getElementById('statusText'),
  forwardBtn: document.getElementById('forwardBtn'),
  backwardBtn: document.getElementById('backwardBtn'),
  leftBtn: document.getElementById('leftBtn'),
  rightBtn: document.getElementById('rightBtn'),
  autoButton: document.getElementById('autoButton'),
  pumpButton: document.getElementById('pumpButton')
};

// Initialize MQTT Connection
function initMQTT() {
  try {
    mqttClient = mqtt.connect(MQTT_CONFIG.broker, {
      username: MQTT_CONFIG.username,
      password: MQTT_CONFIG.password,
      clientId: MQTT_CONFIG.clientId,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 10000
    });

    mqttClient.on('connect', function () {
      console.log('Connected to HiveMQ Cloud');
      isConnected = true;
      updateConnectionStatus(true);
    });

    mqttClient.on('error', function (error) {
      console.error('MQTT Connection Error:', error);
      isConnected = false;
      updateConnectionStatus(false);
    });

    mqttClient.on('offline', function () {
      console.log('MQTT Client Offline');
      isConnected = false;
      updateConnectionStatus(false);
    });

    mqttClient.on('reconnect', function () {
      console.log('Reconnecting to MQTT...');
      updateConnectionStatus(false, 'Menghubungkan...');
    });

  } catch (error) {
    console.error('Failed to initialize MQTT:', error);
    updateConnectionStatus(false);
  }
}

// Update Connection Status
function updateConnectionStatus(connected, customText = null) {
  const statusElement = elements.connectionStatus;
  const textElement = elements.statusText;
  
  if (connected) {
    statusElement.className = 'status-indicator connected';
    textElement.textContent = '🟢 TERHUBUNG';
  } else {
    statusElement.className = 'status-indicator disconnected';
    textElement.textContent = customText || '🔴 TERPUTUS';
  }
}

// Send Command to Robot
function sendCommand(command) {
  if (!isConnected || !mqttClient) {
    console.error('MQTT not connected');
    return;
  }

  // Prevent manual movement when auto mode is active
  if (autoMode && [COMMANDS.FORWARD, COMMANDS.BACKWARD, COMMANDS.LEFT, COMMANDS.RIGHT].includes(command)) {
    console.log('Manual movement disabled in auto mode');
    return;
  }

  try {
    mqttClient.publish(MQTT_CONFIG.topic, command.toString(), { qos: 0 });
    console.log(`Command sent: ${command}`);
    currentCommand = command;
  } catch (error) {
    console.error('Error sending command:', error);
  }
}

// Direction Button Event Handlers
function setupDirectionButtons() {
  const directionButtons = [
    { element: elements.forwardBtn, pressCmd: COMMANDS.FORWARD },
    { element: elements.backwardBtn, pressCmd: COMMANDS.BACKWARD },
    { element: elements.leftBtn, pressCmd: COMMANDS.LEFT },
    { element: elements.rightBtn, pressCmd: COMMANDS.RIGHT }
  ];

  directionButtons.forEach(btn => {
    // Mouse Events
    btn.element.addEventListener('mousedown', function(e) {
      e.preventDefault();
      if (!autoMode) {
        this.classList.add('active');
        sendCommand(btn.pressCmd);
      }
    });

    btn.element.addEventListener('mouseup', function(e) {
      e.preventDefault();
      this.classList.remove('active');
      if (!autoMode) {
        sendCommand(COMMANDS.STOP);
      }
    });

    btn.element.addEventListener('mouseleave', function(e) {
      e.preventDefault();
      this.classList.remove('active');
      if (!autoMode) {
        sendCommand(COMMANDS.STOP);
      }
    });

    // Touch Events
    btn.element.addEventListener('touchstart', function(e) {
      e.preventDefault();
      if (!autoMode) {
        this.classList.add('active');
        sendCommand(btn.pressCmd);
      }
    });

    btn.element.addEventListener('touchend', function(e) {
      e.preventDefault();
      this.classList.remove('active');
      if (!autoMode) {
        sendCommand(COMMANDS.STOP);
      }
    });

    btn.element.addEventListener('touchcancel', function(e) {
      e.preventDefault();
      this.classList.remove('active');
      if (!autoMode) {
        sendCommand(COMMANDS.STOP);
      }
    });

    // Prevent context menu
    btn.element.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });
  });
}

// Auto Button Handler
function setupAutoButton() {
  elements.autoButton.addEventListener('click', function() {
    autoMode = !autoMode;
    
    if (autoMode) {
      this.textContent = 'AUTO ON';
      this.className = 'control-button auto-btn auto-on';
      sendCommand(COMMANDS.AUTO_ON);
      
      // Disable dan ubah tampilan semua tombol directional
      document.querySelectorAll('.direction-btn').forEach(btn => {
        btn.disabled = true;
      });
      
      // Disable pump button juga
      elements.pumpButton.disabled = true;
      
    } else {
      this.textContent = 'AUTO OFF';
      this.className = 'control-button auto-btn auto-off';
      sendCommand(COMMANDS.AUTO_OFF);
      
      // Enable kembali semua tombol directional
      document.querySelectorAll('.direction-btn').forEach(btn => {
        btn.disabled = false;
      });
      
      // Enable kembali pump button
      elements.pumpButton.disabled = false;
    }
  });
}

// Pump Button Handler
function setupPumpButton() {
  // Mouse Events
  elements.pumpButton.addEventListener('mousedown', function(e) {
    e.preventDefault();
    if (!pumpActive) {
      pumpActive = true;
      this.classList.add('active');
      sendCommand(COMMANDS.PUMP_ON);
    }
  });

  elements.pumpButton.addEventListener('mouseup', function(e) {
    e.preventDefault();
    if (pumpActive) {
      pumpActive = false;
      this.classList.remove('active');
      sendCommand(COMMANDS.PUMP_OFF);
    }
  });

  elements.pumpButton.addEventListener('mouseleave', function(e) {
    e.preventDefault();
    if (pumpActive) {
      pumpActive = false;
      this.classList.remove('active');
      sendCommand(COMMANDS.PUMP_OFF);
    }
  });

  // Touch Events
  elements.pumpButton.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if (!pumpActive) {
      pumpActive = true;
      this.classList.add('active');
      sendCommand(COMMANDS.PUMP_ON);
    }
  });

  elements.pumpButton.addEventListener('touchend', function(e) {
    e.preventDefault();
    if (pumpActive) {
      pumpActive = false;
      this.classList.remove('active');
      sendCommand(COMMANDS.PUMP_OFF);
    }
  });

  elements.pumpButton.addEventListener('touchcancel', function(e) {
    e.preventDefault();
    if (pumpActive) {
      pumpActive = false;
      this.classList.remove('active');
      sendCommand(COMMANDS.PUMP_OFF);
    }
  });

  // Prevent context menu
  elements.pumpButton.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
}

// Prevent text selection on buttons
function preventTextSelection() {
  document.querySelectorAll('.control-button').forEach(button => {
    button.addEventListener('selectstart', function(e) {
      e.preventDefault();
    });
  });
}

// Initialize Application
function init() {
  console.log('Initializing Robot Control Application...');
  
  // Setup event handlers
  setupDirectionButtons();
  setupAutoButton();
  setupPumpButton();
  preventTextSelection();
  
  // Initialize MQTT connection
  initMQTT();
  
  // Initial status
  updateConnectionStatus(false, 'Menghubungkan...');
  
  console.log('Application initialized successfully');
}

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    // Page is hidden, send stop command
    if (isConnected && currentCommand !== COMMANDS.STOP && !autoMode) {
      sendCommand(COMMANDS.STOP);
    }
  }
});

// Handle page unload
window.addEventListener('beforeunload', function() {
  if (isConnected && !autoMode) {
    sendCommand(COMMANDS.STOP);
  }
  if (mqttClient) {
    mqttClient.end();
  }
});

// Start application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);