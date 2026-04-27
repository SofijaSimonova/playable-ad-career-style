import { Application, Sprite, Assets, Graphics, Container, Text } from "pixi.js";

(async () => {
    const app = new Application();
    await app.init({
        resizeTo: window,
    });
    app.canvas.style.position = 'absolute';
    document.body.appendChild(app.canvas);

    
    const LAYOUT = {
        optionOffsetX: 230,
        optionSize: 180,
        optionGap: 20,
        girlScale: 0.80,
    };


    const [
        texture,
        girl_texture,
        defaultFaceTexture,
        rightFaceTexture,
        wrongFaceTexture,
        rightStampTexture,
        wrongStampTexture,
    ] = await Promise.all([
        Assets.load("/bg/background_option2.png"),
        Assets.load("/character/body_base_glow.png"),
        Assets.load("/character/faces/default_face_glow.png"),
        Assets.load("/character/faces/happy_face_right_choice_glow.png"),
        Assets.load("/character/faces/sad_face_wrong_choice_glow.png"),
        Assets.load("/stamps/win_stamp.png"),
        Assets.load("/stamps/fail_stamp.png"),
    ]);

    const stampSound = new Audio("/sounds/Video Project.m4a");

    const background = new Sprite(texture);
    background.anchor.set(0.5);
    app.stage.addChild(background);

    function resizeBackground() {
        background.x = app.screen.width / 2;
        background.y = app.screen.height / 2;
        const scaleX = app.screen.width / background.texture.width;
        const scaleY = app.screen.height / background.texture.height;
        background.scale.set(Math.max(scaleX, scaleY));
    }
    window.addEventListener("resize", resizeBackground);
    resizeBackground();

    const girlContainer = new Container();
    app.stage.addChild(girlContainer);
    girlContainer.pivot.set(0, 0);

    const bodyLayer    = new Container();
    const shoeLayer    = new Container();
    const pantsLayer   = new Container();
    const topLayer     = new Container();
    const hairLayer    = new Container();
    const faceLayer    = new Container();
    const confettiLayer = new Container();

    girlContainer.addChild(bodyLayer);
    girlContainer.addChild(shoeLayer);
    girlContainer.addChild(pantsLayer);
    girlContainer.addChild(topLayer);
    girlContainer.addChild(faceLayer);
    girlContainer.addChild(hairLayer);
    girlContainer.addChild(confettiLayer); 

    const girl = new Sprite(girl_texture);
    girl.anchor.set(0.5);
    girl.x = 0;
    girl.y = 0;
    bodyLayer.addChild(girl);

    const faceSprite = new Sprite(defaultFaceTexture);
    faceSprite.anchor.set(0.5);
    faceSprite.x = girl.x;
    faceSprite.y = girl.y;
    faceLayer.addChild(faceSprite);

    function positionGirl() {
        girlContainer.position.set(app.screen.width / 2, app.screen.height / 2);
        girlContainer.scale.set(LAYOUT.girlScale);
    }
    window.addEventListener("resize", positionGirl);
    positionGirl();

    const introText = new Text("Help her get ready for a job interview", {
        fontFamily: "Arial",
        fontSize: 32,
        fill: 0x333333,
        fontWeight: "bold",
        align: "center",
    });
    introText.anchor.set(0.5);
    introText.x = app.screen.width / 2;
    introText.y = 60;
    app.stage.addChild(introText);


    const stampContainer = new Container();
    app.stage.addChild(stampContainer);

    const stampSprite = new Sprite(rightStampTexture);
    stampSprite.anchor.set(0.5);
    stampContainer.addChild(stampSprite);
    stampContainer.visible = false;

    stampContainer.x = app.screen.width / 2;
    stampContainer.y = app.screen.height / 2 + 250;

    window.addEventListener("resize", () => {
        girlContainer.position.set(app.screen.width / 2, app.screen.height / 2);
        stampContainer.x = app.screen.width / 2;
    });


    const optionsContainer = new Container();
    app.stage.addChild(optionsContainer);

    let currentZoomAnimation = null;
    let hairStageStarted = false;
    let hadWrongChoice = false;

    const shirts = [
        { icon: "/clothes/shirts/hoodie_glow.png",                   w: 350, h: 550, offsetX: 95, offsetY: 140, layer: topLayer,   isCorrect: false },
        { icon: "/clothes/shirts/top_redVest_whiteSleeves_glow.png", w: 350, h: 550, offsetX: 95, offsetY: 140, layer: topLayer,   isCorrect: true  },
    ];

    const hairs = [
        { icon: "/hair/straight_hair_glow.png",       w: 500, h: 700, offsetX: 95, offsetY: 245, layer: hairLayer, isCorrect: true  },
        { icon: "/hair/messy_unbrushed_hair_glow.png", w: 500, h: 700, offsetX: 95, offsetY: 245, layer: hairLayer, isCorrect: false },
    ];

    const pants = [
        { icon: "/clothes/pants/black_flare_jeans_glow.png",        w: 250, h: 350, offsetX: 95, offsetY: 30, layer: pantsLayer, isCorrect: true  },
        { icon: "/clothes/pants/black_flare_jeans_glow_ripped.png", w: 250, h: 350, offsetX: 95, offsetY: 30, layer: pantsLayer, isCorrect: false },
    ];

    const shoes = [
        { icon: "/clothes/shoes/boots_shoes_glow.png",   w: 600, h: 900, offsetX: 85, offsetY: -250, layer: shoeLayer, isCorrect: true  },
        { icon: "/clothes/shoes/sneaker_shoes_glow.png", w: 600, h: 900, offsetX: 85, offsetY: -250, layer: shoeLayer, isCorrect: false },
    ];
    
    function setDefaultFace()     { faceSprite.texture = defaultFaceTexture; }
    function setRightChoiceFace() { faceSprite.texture = rightFaceTexture;   }
    function setWrongChoiceFace() { faceSprite.texture = wrongFaceTexture;   }

    function showOutcome() {
        if (hadWrongChoice) {
            stampSprite.texture = wrongStampTexture;
            setWrongChoiceFace();
        } else {
            setRightChoiceFace();
        }
        setTimeout(addStamp, 2000);
    }

    function addStamp() {
        stampContainer.visible = true;
        const targetY = app.screen.height / 2;
        const speed   = 0.09;

        stampSound.currentTime = 0;
        stampSound.play().catch((err) => console.warn("Stamp sound error:", err));

        function animate() {
            stampContainer.y += (targetY - stampContainer.y) * speed;
            if (Math.abs(stampContainer.y - targetY) < 1) {
                stampContainer.y = targetY;
                app.ticker.remove(animate);
            }
        }
        app.ticker.add(animate);
    }

    function zoomTo({ scale, offsetY = 0, speed = 0.04, onComplete = null }) {
        introText.visible = false
        const targetScale = scale;
        const targetX     = app.screen.width  / 2;
        const targetY     = app.screen.height / 2 - offsetY;

        if (currentZoomAnimation) {
            app.ticker.remove(currentZoomAnimation);
        }

        currentZoomAnimation = function () {
            girlContainer.scale.x += (targetScale - girlContainer.scale.x) * speed;
            girlContainer.scale.y += (targetScale - girlContainer.scale.y) * speed;
            girlContainer.x       += (targetX     - girlContainer.x)       * speed;
            girlContainer.y       += (targetY     - girlContainer.y)       * speed;

            const done =
                Math.abs(girlContainer.scale.x - targetScale) < 0.01 &&
                Math.abs(girlContainer.x - targetX) < 1 &&
                Math.abs(girlContainer.y - targetY) < 1;

            if (done) {
                girlContainer.scale.set(targetScale);
                girlContainer.position.set(targetX, targetY);
                app.ticker.remove(currentZoomAnimation);
                currentZoomAnimation = null;
                if (onComplete) onComplete();
            }
        };

        app.ticker.add(currentZoomAnimation);
    }


    function fadeOutOptions(callback) {
        function fade() {
            optionsContainer.alpha -= 0.08;
            if (optionsContainer.alpha <= 0) {
                optionsContainer.alpha = 1;
                clearOptions();
                app.ticker.remove(fade);
                if (callback) callback();
            }
        }
        app.ticker.add(fade);
    }

    function clearOptions() {
        optionsContainer.removeChildren();
    }

    function makeDraggable(sprite, overlayPath, layer, isCorrect) {
        sprite.eventMode = "static";
        sprite.cursor    = "pointer";

        let dragging   = false;
        let dragOffset = { x: 0, y: 0 };

        sprite.on("pointerdown", (event) => {
            dragging = true;
            sprite.alpha = 0.7;
            const pos    = event.data.getLocalPosition(sprite.parent);
            dragOffset.x = sprite.x - pos.x;
            dragOffset.y = sprite.y - pos.y;
        });

        sprite.on("pointermove", (event) => {
            if (!dragging) return;
            const pos = event.data.getLocalPosition(sprite.parent);
            sprite.x  = pos.x + dragOffset.x;
            sprite.y  = pos.y + dragOffset.y;
        });

        async function onDrop() {
            if (!dragging) return;
            dragging     = false;
            sprite.alpha = 1;
            clearOptions();
            sprite.visible = false;

    
            const overlayTexture = await Assets.load(overlayPath);
            const overlaySprite  = new Sprite(overlayTexture);
            overlaySprite.anchor.set(0.5);
            overlaySprite.x = girl.x;
            overlaySprite.y = girl.y;
            layer.addChild(overlaySprite);

        
            if (layer !== shoeLayer) {
                if (isCorrect) {
                    setRightChoiceFace();
                } else {
                    setWrongChoiceFace();
                    hadWrongChoice = true;
                }
                setTimeout(setDefaultFace, 1000);
            } else {
                if (!isCorrect) hadWrongChoice = true;
            }

    
            if (layer === topLayer) {
                createOutfitOptions(pants);

            } else if (layer === pantsLayer && !hairStageStarted) {
                hairStageStarted = true;
                fadeOutOptions(() => {
                    zoomTo({ scale: 1.8, offsetY: -300, speed: 0.04 });
                    createOutfitOptions(hairs, app.screen.height - 550);
                });

            } else if (layer === hairLayer) {
                setTimeout(() => {
                    zoomTo({
                        scale: 1.6,
                        offsetY: 470,
                        speed: 0.08,
                        onComplete: () => createOutfitOptions(shoes),
                    });
                }, 1000);

            } else if (layer === shoeLayer) {
                zoomTo({ scale: LAYOUT.girlScale, offsetY: 0, speed: 0.02 });
                showOutcome();
            }
        }

        sprite.on("pointerup",        onDrop);
        sprite.on("pointerupoutside", onDrop);
    }

    async function createOutfitOptions(list, customY = app.screen.height / 2) {
        clearOptions();

        await Promise.all(list.map(async (outfit, index) => {
            const square = new Graphics();
            square.roundRect(0, 0, LAYOUT.optionSize, LAYOUT.optionSize, 20).fill({ color: "white" });
            square.x =
                app.screen.width / 2 +
                (index === 0
                    ? -LAYOUT.optionOffsetX - LAYOUT.optionSize / 2 - LAYOUT.optionGap
                    :  LAYOUT.optionOffsetX - LAYOUT.optionSize / 2 + LAYOUT.optionGap);
            square.y = customY - 150;
            optionsContainer.addChild(square);

            const outfitTexture = await Assets.load(outfit.icon);
            const outfitSprite  = new Sprite(outfitTexture);
            outfitSprite.anchor.set(0.5);
            outfitSprite.width  = outfit.w;
            outfitSprite.height = outfit.h;
            outfitSprite.x      = square.x + outfit.offsetX;
            outfitSprite.y      = square.y + outfit.offsetY;
            optionsContainer.addChild(outfitSprite);

            makeDraggable(outfitSprite, outfit.icon, outfit.layer, outfit.isCorrect);
        }));
    }

    createOutfitOptions(shirts);

})();