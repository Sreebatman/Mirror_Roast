// DOM Elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const placeholder = document.getElementById('placeholder');
const startBtn = document.getElementById('startBtn');
const roastBtn = document.getElementById('roastBtn');
const roastDisplay = document.getElementById('roast');
const expressionDisplay = document.getElementById('expression');
const confidenceDisplay = document.getElementById('confidence');
const loading = document.getElementById('loading');

// Canvas context
const ctx = canvas.getContext('2d');

// Roasts database
const roasts = {
    happy: [
        "Someone's a little too cheerful... Did you find a penny on the sidewalk?",
        "That grin is so forced, I can see your soul crying behind it.",
        "You look like someone who laughs at their own jokes. How sad.",
        "Are you happy or did you just forget how to turn off smile mode?",
        "That smile is so fake, I think I saw it on sale at Walmart."
    ],
    sad: [
        "Cheer up! Or don't. Honestly, I don't care either way.",
        "You look like a sad puppy. A really, really ugly sad puppy.",
        "Is that your natural face or did someone steal your lunch money?",
        "You look like you just realized your favorite show got canceled.",
        "That expression says 'I forgot to save my work before closing'."
    ],
    angry: [
        "Whoa, someone woke up on the wrong side of the ugly tree!",
        "Is that anger or did you just smell your own cooking?",
        "You look like you're about to yell at a barista for spelling your name wrong.",
        "Did someone use the last of the coffee? Or are you always this pleasant?",
        "If looks could kill, you'd probably just give someone a mild rash."
    ],
    surprised: [
        "What's the matter? Did you just realize how much time you waste online?",
        "You look like you just saw a ghost... or your own reflection.",
        "That expression says 'I left the oven on' but your face says 'I never cook'.",
        "Surprised? Did you actually accomplish something today?",
        "You look like someone just told you the earth isn't flat."
    ],
    disgusted: [
        "Did you just smell your own breath? I don't blame you for that face.",
        "You look like you just watched someone put pineapple on pizza.",
        "That expression says 'I stepped in something' but your face says 'I am something'.",
        "Is that disgust or your natural resting face? Hard to tell.",
        "You look like you just tasted 'healthy' ice cream."
    ],
    fearful: [
        "Relax, it's just an AI judging you. What could possibly go wrong?",
        "You look like you just realized your search history isn't private.",
        "Is that fear or did you remember that embarrassing thing from 5 years ago?",
        "Don't be scared, I'm sure you're only slightly below average!",
        "You look like someone just said 'we need to talk'."
    ],
    neutral: [
        "Wow, what an expression... said no one ever.",
        "Your face is so neutral, even beige is jealous.",
        "You look like you're contemplating what to order from a menu you've seen 100 times.",
        "That expression says 'I forgot why I walked into this room'.",
        "If boredom had a face... oh wait, I'm looking at it."
    ]
};

// Current expression tracking
let currentExpression = 'neutral';
let modelLoaded = false;
let faceDetectionModel;

// Initialize face detection
async function initFaceDetection() {
    try {
        loading.style.display = 'block';
        
        // Load models
        faceDetectionModel = await faceLandmarksDetection.load(
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
            { maxFaces: 1 }
        );
        
        modelLoaded = true;
        loading.style.display = 'none';
        
        // Set canvas size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Start detection loop
        detectFace();
    } catch (error) {
        console.error('Error loading models:', error);
        loading.style.display = 'none';
        roastDisplay.textContent = "Failed to load AI models. Please refresh the page.";
    }
}

// Detect face expressions
async function detectFace() {
    if (!modelLoaded) return;
    
    try {
        const predictions = await faceDetectionModel.estimateFaces({
            input: video,
            predictIrises: false,
            flipHorizontal: true
        });
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (predictions.length > 0) {
            const face = predictions[0];
            
            // Draw face mesh
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 1;
            
            if (face.scaledMesh) {
                face.scaledMesh.forEach(point => {
                    ctx.beginPath();
                    ctx.arc(point[0], point[1], 1, 0, 2 * Math.PI);
                    ctx.stroke();
                });
            }
            
            // Update expression
            if (face.expressions) {
                const expressions = face.expressions;
                const maxExpression = Object.keys(expressions).reduce((a, b) => 
                    expressions[a] > expressions[b] ? a : b
                );
                
                currentExpression = maxExpression;
                const confidence = Math.round(expressions[maxExpression] * 100);
                
                expressionDisplay.textContent = maxExpression.charAt(0).toUpperCase() + maxExpression.slice(1);
                confidenceDisplay.textContent = `${confidence}%`;
            }
        }
    } catch (error) {
        console.error('Error detecting face:', error);
    }
    
    // Continue detection
    requestAnimationFrame(detectFace);
}

// Start webcam
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user" } 
        });
        
        video.srcObject = stream;
        video.style.display = 'block';
        placeholder.style.display = 'none';
        
        // Wait for video to load metadata
        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Initialize face detection after video starts
            initFaceDetection();
        });
        
        roastBtn.disabled = false;
        startBtn.textContent = "Camera Started";
        startBtn.disabled = true;
    } catch (error) {
        console.error('Error accessing camera:', error);
        roastDisplay.textContent = "Camera access denied. Please enable your camera and refresh.";
    }
}

// Generate roast based on expression
function generateRoast() {
    const expressionRoasts = roasts[currentExpression] || roasts.neutral;
    const randomRoast = expressionRoasts[Math.floor(Math.random() * expressionRoasts.length)];
    
    roastDisplay.textContent = randomRoast;
    
    // Add animation effect
    roastDisplay.style.transform = "scale(1.1)";
    setTimeout(() => {
        roastDisplay.style.transform = "scale(1)";
    }, 300);
}

// Event Listeners
startBtn.addEventListener('click', startCamera);
roastBtn.addEventListener('click', generateRoast);

// Initial setup
roastBtn.disabled = true;
