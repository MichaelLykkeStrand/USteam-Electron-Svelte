<script>
    import { color, hue } from "color-blend";
    import { convertHexToRgb } from "@mdhnpm/rgb-hex-converter";
    var rgb2hex = require("rgb2hex");
    export let account;

    let defaultColor = "#3c2363";
    $: {
        updateColor();
    }

    let fill1;
    let fill2;
    let fill3;
    let fill4;
    let fill5;
    updateColor();

    function updateColor() {
        fill1 = "#FFFFFF"
        fill2 = getGradientColor(account.color, defaultColor);
        fill3 = getGradientColor(defaultColor, fill2);
        fill4 = getGradientColor(defaultColor, fill3);
        fill5 = getGradientColor(defaultColor, fill4);
    }

    function getGradientColor(hex1, hex2) {
        let rgbaArray = convertHexToRgb(hex1);
        let rgb = { r: rgbaArray[0], g: rgbaArray[1], b: rgbaArray[2], a: 0.7 };
        console.log("original1:");
        console.log(rgb);
        let rgbaArray2 = convertHexToRgb(hex2);
        let rgb2 = {
            r: rgbaArray2[0],
            g: rgbaArray2[1],
            b: rgbaArray2[2],
            a: 0.4,
        };
        console.log("original2:");
        console.log(rgb2);
        let colorResult = hue(rgb, rgb2);
        console.log("final:");
        console.log(colorResult);
        console.log(
            rgb2hex(
                "rgb(" +
                    colorResult.r +
                    "," +
                    colorResult.g +
                    "," +
                    colorResult.b +
                    ")"
            ).hex
        );
        return rgb2hex(
            "rgb(" +
                colorResult.r +
                "," +
                colorResult.g +
                "," +
                colorResult.b +
                ")"
        ).hex;
    }
</script>

<div class="grid-container account-preview-card">
    <div class="wrap-layer">
        <div class="text-layer">
            <img src={account.avatarImg} alt="avatarImg" class="center" />
            <strong>{account.username}</strong>
        </div>
        <div class="background-layer">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                viewBox="0 0 1000 727"
            >
                <rect id="E1" fill={fill1} width="1600" height="800" rx="8" />
                <path
                    id="E2"
                    fill={fill2}
                    d="M478.4 581c3.2 0.8 6.4 1.7 9.5 2.5c196.2 52.5 388.7 133.5 593.5 176.6c174.2 36.6 349.5 29.2 518.6-10.2V0H0v574.9c52.3-17.6 106.5-27.7 161.1-30.9C268.4 537.4 375.7 554.2 478.4 581z"
                />
                <path
                    id="E3"
                    fill={fill3}
                    d="M181.8 259.4c98.2 6 191.9 35.2 281.3 72.1c2.8 1.1 5.5 2.3 8.3 3.4c171 71.6 342.7 158.5 531.3 207.7c198.8 51.8 403.4 40.8 597.3-14.8V0H0v283.2C59 263.6 120.6 255.7 181.8 259.4z"
                />
                <path
                    id="E4"
                    fill={fill4}
                    d="M454.9 86.3C600.7 177 751.6 269.3 924.1 325c208.6 67.4 431.3 60.8 637.9-5.3c12.8-4.1 25.4-8.4 38.1-12.9V0H288.1c56 21.3 108.7 50.6 159.7 82C450.2 83.4 452.5 84.9 454.9 86.3z"
                />
                <path
                    id="E5"
                    fill={fill5}
                    d="M1397.5 154.8c47.2-10.6 93.6-25.3 138.6-43.8c21.7-8.9 43-18.8 63.9-29.5V0H643.4c62.9 41.7 129.7 78.2 202.1 107.4C1020.4 178.1 1214.2 196.1 1397.5 154.8z"
                />
            </svg>
        </div>
    </div>
</div>

<style>
    .wrap-layer {
        width: 100%;
        height: 100%;
        border-radius: 8px;
    }
    .text-layer {
        position: absolute;
        width: 100%;
        height: auto;
        top: 0;
        left: 0;
        padding: 30px;
        text-align: center;
        font-size: 32px;
        line-height: 1.2;
        pointer-events: none;
    }

    .center {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 50%;
    }

    .background-layer {
        width: 100%;
        height: 100%;
        -webkit-background-size: cover;
        -moz-background-size: cover;
        -o-background-size: cover;
        background-size: cover;
    }

    img {
        border-radius: 50%;
    }

    .account-preview-card {
        position: relative;
        text-align: center;
        display: inline-block;
        margin: 15px;
        background-color: #fff;
        width: 330px;
        height: 240px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(56, 51, 64, 0.411);
    }
</style>
