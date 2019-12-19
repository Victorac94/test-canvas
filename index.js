window.onload = () =>  {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const clearCanvasButton = document.querySelector(".clearCanvasButton");
    const canvasMenu = document.querySelector(".canvasMenu");
    const brush = document.getElementById("customCursor");
    const setBrushRadiusInput = document.querySelector(".setCursorRadiusInput");
    const setOpacityInput = document.querySelector(".setOpacityInput");
    const jscolorInput = document.querySelector(".jscolor");
    let forceBrushColor = document.querySelector(".setBrushColorForce");
    let shouldDraw = false; // Flag
    let circleRadius = 20;
    let strokeColor = null;
    let brushColor = null;
    let alphaColor = 0.5;
    let colorsIncreasing = [true, true, true]; // Indicates if each rgba() color value is increasing or decreasing when using changinColor()
    
    // Handle dimensions of canvas to fit the window
    setCanvasDimensions = () => {
        canvas.height = document.documentElement.offsetHeight; 
        canvas.width = document.documentElement.offsetWidth;
    };

    // Get canvas snapshot
    getCanvasSnapshot = () => {
        return canvas.toDataURL("image/png", 1.0); // Defines both type of image and quality
    }

    // Put snapshot of canvas previously taken in new canvas
    setCanvasSnapshot = snapshot => {
        let canvasImage = new Image();

        canvasImage.onload = function() {
            ctx.drawImage(canvasImage, 0, 0);
        }
        canvasImage.src = snapshot;
    }
    
    // Handle the change of size and position of the cursor while manipulating theese parameters
    setBrush = (position, size, mouse) => {
        // Move custom cursor position alongside mouse coordinates XY
        if (position) {
            brush.style.transform = `translate(${mouse.clientX - circleRadius - (canvas.width/2)}px, ${mouse.clientY - circleRadius - (canvas.height/2)}px)`;
        }

        if (size) {
            // Size of custom cursor equal to set diameter
            brush.style.width = circleRadius * 2 + "px";
            brush.style.height = circleRadius * 2 + "px";
        }

        if (brush.style.opacity == 0) {
            brush.style.opacity = 1;
        }
    }

    // Set brush color while on user selected color mode
    setBrushColor = ev => {
        brushColor = ev.target.value;
    }

    // Set radius of brush
    setBrushRadius = (scrollingUp, mouse, fromInput) => {
        if (scrollingUp) {
            circleRadius += 1; // Make radius bigger
        }
        else if (circleRadius >= 1) {
            circleRadius -= 1; // Make radius smaller
            
            circleRadius <= 0 ? circleRadius = 1 : null; // Make sure circleRadius is never below 1px radius
        }

        if (mouse) {
            setBrush(true, true, mouse);
        } else if (fromInput) {
            // Make sure input is never empty or exceeds the minimum or maximum
            if (fromInput.target.value == "" || fromInput.target.value < 1 || fromInput.target.value > 2000) {
                setBrushRadiusInput.value = 1;
            } else {
                circleRadius = setBrushRadiusInput.value;
            }
        }
    }

    // Set color opacity of brush
    setBrushOpacity = (fromInput, bigger, myInput) => {
        // If opacity value comes from input tag
        if (fromInput) {
            alphaColor = myInput.target.value;
        } 
        else if (alphaColor >= 1.0 && bigger) {
            alphaColor = 1;
            myInput.value = 1;
        }
        else if (alphaColor <= 0.1 && !bigger) {
            alphaColor = 0.1;
            myInput.value = 0.1;
        }
        else if (bigger) {
            alphaColor = alphaColor + 0.1;
            myInput.value = alphaColor;
        } else {
            alphaColor = alphaColor - 0.1;
            myInput.value = alphaColor;
        }
    }

    // Get a random rgba() color to draw
    randomColor = () => {
        let colors = [];

        for (let i = 1; i <= 3; i++) {
            c = Math.floor(Math.random() * 256); // Get a random integer number between 0 and 255
            colors.push(c);
        }
        
        return `rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, ${alphaColor})`;
    }

    draw = ev => {
        if (shouldDraw) {
            if (forceBrushColor.checked) {
                brushColor = jscolorInput.jscolor.toRGBString();
            }
            ctx.moveTo(ev.clientX + circleRadius, ev.clientY);
            ctx.beginPath();
            ctx.arc(ev.clientX, ev.clientY, circleRadius, 0, Math.PI*2, false); // Circle
            ctx.fill();
            
            // Begin drawing
            document.onmousemove = (ev) => {
                ctx.beginPath();
                ctx.arc(ev.clientX, ev.clientY, circleRadius, 0, Math.PI*2, false); // Circle
                ctx.fillStyle = brushColor;
                ctx.strokeStyle = brushColor;
                ctx.fill();
                brushColor = forceBrushColor.checked ? brushColor : changingColor(brushColor); // if forceBrushColor is checked don't change current (selected) color
                setBrush(true, false, ev);
            }
        }
        else {
            // Do not draw
            document.onmousemove = null;
        }
    }

    // Clear entine canvas from drawings
    clearCanvas = (ev) => {
        // Prevent context menu from showing
        window.oncontextmenu = () => false;
        // Clear canvas from all drawings
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Change brush color randomly on every new brush
    changingColor = (initialColor) => {
        // Get the rgba color numbers
        let colorValues = initialColor.match(/\d{1,3}/g);

        // Add 1 to the value of each individual color of rgba()
        let newC = colorValues.map((c, index, array) => {
            // Exclude alpha value from rgba()
            if (index < 3) {
                let q = Math.floor(Math.random() * 5); // Get a random number by which current color is being increased or decreased
                c = Number.parseInt(c); // Parse color value from text to number

                if (c >= 255) {
                    colorsIncreasing[index] = false; // Color starts decreasing
                }
                else if (c <= 0) {
                    colorsIncreasing[index] = true; // Color starts increasing
                }
                if (colorsIncreasing[index]) {
                    return c = c + q; // Increase value of color
                }
                else {
                    return c = c - q; // Decrease value of color
                }
            }
        })
        
        newC = `rgba(${newC[0]}, ${newC[1]}, ${newC[2]}, ${alphaColor})`;
        brushColor = newC;
        strokeColor = newC;

        return newC;
    }

    addColorTransparency = color => {
        arrayColor = color.map(c => c); // Move the rgb() colors to an array
        return `rgba(${arrayColor[0]}, ${arrayColor[1]}, ${arrayColor[2]}, ${alphaColor})`;
    }

    showHideCanvasMenu = () => {
        if (canvasMenu.style.opacity === "0") {
            canvasMenu.style.opacity = "1";
        } else {
            canvasMenu.style.opacity = "0";
        }
    }

    // IIFE. Set initial settings of canvas custom cursor (brush) and brush color
    (function() {
        setOpacityInput.value = alphaColor;
        setBrushRadiusInput.value = circleRadius;
        brushColor = randomColor();
        setCanvasDimensions();
    })();

    // On window resize save drawings of canvas (Because on resize canvas resets the drawings)
    window.addEventListener("resize", () => {
        let snapshot = getCanvasSnapshot();
        setCanvasDimensions();
        setCanvasSnapshot(snapshot);
    })

    // Make brush appear when mouse enters canvas
    document.addEventListener("mouseenter", ev => {
        brush.style.opacity = 1;
    });

    // Make brush dissappear when mouse leaves canvas
    document.addEventListener("mouseleave", ev => {
        brush.style.opacity = 0;
    });

    // Start painting
    document.addEventListener("mousedown", ev => {
        // Left mouse button
        if (ev.which == 1) {
            shouldDraw = true;
            draw(ev);
        }
    });

    // Stop painting or clear canvas
    document.addEventListener("mouseup", ev => {
        // Left mouse button
        if (ev.which == 1) {
            shouldDraw = false;
            draw(ev);
        }
        // Right mouse button
        else if (ev.which == 3) {
            clearCanvas(ev);
        }
    });

    // On mouse move set brush to follow the mouse/cursor
    document.addEventListener("mousemove", ev => {
        setBrush(true, true, ev);
    });

    // Handle making brush radius bigger or smalled when scrolling down or up
    document.addEventListener("wheel", ev => {
        let scrollingUp;

        if (ev.deltaY < 0) {
            scrollingUp = true;
        } else {
            scrollingUp = false;
        }
        setBrushRadius(scrollingUp, ev);
    });

    // Show/hide canvas settings menu and change brush paint opacity
    document.addEventListener("keydown", ev => {
        if (ev.key === "h") {
            showHideCanvasMenu();
        } else if (ev.key === "+") {
            let input = document.querySelector(".setOpacityInput");
            setBrushOpacity(null, true, input);
        } else if (ev.key === "-") {
            let input = document.querySelector(".setOpacityInput");
            setBrushOpacity(null, false, input);
        }
    })

    // Handle brush painting color selected by the user
    jscolorInput.addEventListener("input", ev => {
        setBrushColor(ev);
    });

    // Handle brush radius set by the user
    setBrushRadiusInput.addEventListener("input", ev => {
        setBrushRadius(false, false, ev);
    });

    // Handle brush painting opacity set by the user
    setOpacityInput.addEventListener("input", ev => {
        setBrushOpacity(ev);
    });
    
    // Handle clear entire canvas
    clearCanvasButton.addEventListener("click", ev => {
        clearCanvas();
    });
};