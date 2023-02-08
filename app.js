/*eslint-env chroma*/
/*global chrome*/



const colorDivs = document.querySelectorAll(".color");
// console.log(colorDivs)
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHex = document.querySelectorAll(".color h2");
const popup = document.querySelector('.copy-container');
const adjustBtn = document.querySelectorAll('.adjust');
const closeAdjust = document.querySelectorAll('.close-adjustment');
const sliderContainer = document.querySelectorAll('.sliders');
const lockButton = document.querySelectorAll('.lock');

let initialColors;
let savedPalettes = [];

sliders.forEach(slider=>{
    slider.addEventListener('input',hslControls);
});


lockButton.forEach((div)=>{
    div.addEventListener('click',(e)=>{
        if(!e.target.parentElement.parentElement.classList.contains('locked')){
            e.target.parentElement.parentElement.classList.add('locked');
            e.target.children[0].classList.remove('fa-lock-open');
            e.target.children[0].classList.add('fa-lock');
            
        }
        else{
            e.target.parentElement.parentElement.classList.remove('locked');
            e.target.children[0].classList.remove('fa-lock');
            e.target.children[0].classList.add('fa-lock-open');
        } 
    });
})

colorDivs.forEach((div,index)=>{
    div.addEventListener('change',()=>{
        updateTextUi(index);
    });
});

currentHex.forEach(hex=>{
    hex.addEventListener("click",()=>{
        copyToClipboard(hex);
    })
});

popup.addEventListener('transitionend',()=>{
    const popupBox =    popup.children[0];
    popup.classList.remove('active');
    popupBox.classList.remove('active');
});

adjustBtn.forEach((button,index)=>{
    button.addEventListener("click",()=>{
        openAdjustmentPanel(index);
    });
});

closeAdjust.forEach((close,index)=>{
    close.addEventListener('click',()=>{
        closeAdjustmentPanel(index);
    });
});

generateBtn.addEventListener('click',randomColors);

function generateHex(){
    const letters = "0123456789ABCDEF";
    let hash = '#';
    for(let i=0;i<6;i++){
        hash += letters[Math.floor(Math.random()*16)];

    }
    return hash;
}

function randomColors(){
    initialColors = [];
    colorDivs.forEach((div,index)=>{
        const hexText = div.children[0];
        const randomColor = generateHex();
        // console.log(initialColors)
        if(div.classList.contains('locked')){
            initialColors.push(hexText.innerText);
            return;
        }else{  
            initialColors.push(chroma(randomColor).hex());
        }
        // console.log(initialColors)
        

        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
        checkTextContrast(randomColor,hexText);

        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input");
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation  = sliders[2];

        colorizeSliders(color,hue,brightness,saturation);
    });   

    resetInputs();
    
    adjustBtn.forEach((button,index)=>{
        checkTextContrast(initialColors[index],button);
        checkTextContrast(initialColors[index],lockButton[index]);
    });
}

function checkTextContrast(color,text){
    const luminance = chroma(color).luminance();
    if(luminance > 0.5){
        text.style.color = "black";
    }
    else{
        text.style.color = "white";
    }
}

function colorizeSliders(color,hue,brightness,saturation){
    const noSat = color.set('hsl.s',0);
    const fullSat = color.set('hsl.s',1);

    const scaleSet = chroma.scale([noSat,color,fullSat]);

    const midBright = color.set('hsl.l',0.5);
    const scaleBright = chroma.scale(['black',midBright,'white']);


    saturation.style.backgroundImage = `linear-gradient(to right,${scaleSet(0)},${scaleSet(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(0)},${scaleBright(0.5)},${scaleBright(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`
}

function hslControls(e){
    const index = e.target.getAttribute("data-bright") || e.target.getAttribute("data-sat") || e.target.getAttribute("data-hue");
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    const bgColor = initialColors[index];
    
    let color = chroma(bgColor).set('hsl.s',saturation.value).set('hsl.l',brightness.value).set('hsl.h',hue.value);
    colorDivs[index].style.backgroundColor = color;
    colorizeSliders(color,hue,brightness,saturation);

}

function updateTextUi(index){
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2'); 
    const icons = activeDiv.querySelectorAll('.controls button');
    textHex.innerText = color.hex();
    checkTextContrast(color,textHex);

    for(icon of icons){
        checkTextContrast(color,icon);
    }
}

function resetInputs(){
    const sliders  = document.querySelectorAll('.sliders input');
    sliders.forEach(slider =>{
        if(slider.name === 'hue'){
            const hueColor = initialColors[slider.getAttribute('data-hue')];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }
        if(slider.name === 'brightness'){
            const brightColor = initialColors[slider.getAttribute('data-bright')];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = Math.floor(brightValue * 100)/100;
        }
        if(slider.name === 'saturation'){
            const satColor = initialColors[slider.getAttribute('data-sat')];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue *100)/100;
        }
    });
}

function copyToClipboard(hex){
    const el = document.createElement('textarea');
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    const popupBox = popup.children[0];
    popup.classList.add('active');
    popupBox.classList.add('active');    
}

function openAdjustmentPanel(index){
    sliderContainer[index].classList.toggle('active');
}
function closeAdjustmentPanel(index){
    sliderContainer[index].classList.remove('active');
}

const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave  = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');

saveBtn.addEventListener("click",openPalette);
closeSave.addEventListener("click",closePalette);
submitSave.addEventListener("click",savePalette);
libraryBtn.addEventListener("click",openLibrary);
closeLibraryBtn.addEventListener("click",closeLibrary); 

function openPalette(e){
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
}

function closePalette(e){
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');   
}

function savePalette(e){
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
    const name = saveInput.value;
    const colors = [];
    currentHex.forEach(hex=>{
        colors.push(hex.innerText);
    });

    let paletteNum;
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    if(paletteObjects){
        paletteNum = paletteObjects.length;
        console.log(paletteNum,"gg")
    }
    else{
        paletteNum = savedPalettes.length;
        console.log(paletteNum,"ff")
    }
    // console.log(paletteNum)
    const paletteObj  = {name,colors,nr:paletteNum};
    savedPalettes.push(paletteObj);
    

    savetoLocal(paletteObj);
    saveInput.value = "";

    const palette = document.createElement('div');
    palette.classList.add('custom-palette');
    const title = document.createElement('h4');
    title.innerText = paletteObj.name;
    const preview = document.createElement('div');
    preview.classList.add('small-preview');

    paletteObj.colors.forEach(smallColor =>{
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
    });

    const paletteBtn = document.createElement('button');
    paletteBtn.classList.add('pick-palette-btn');
    paletteBtn.classList.add(`${paletteNum}`);
    paletteBtn.innerText = 'Select';

    paletteBtn.addEventListener("click",e=>{
        closeLibrary();
        // console.log(e)
        const paletteIndex = e.target.classList[1];
        // console.log(paletteIndex)
        initialColors = [];
        // console.log(savedPalettes)
        savedPalettes[paletteIndex].colors.forEach((color,index)=>{
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color,text);
            updateTextUi(index);
        });
        resetInputs();
    });

    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);
}

function savetoLocal(paletteObj){
    let localPalettes;
    if(localStorage.getItem('palettes')===null){
        localPalettes = [];
    }
    else{
        localPalettes = JSON.parse(localStorage.getItem("palettes"));
    }
    localPalettes.push(paletteObj);
    localStorage.setItem('palettes',JSON.stringify(localPalettes));
}

function openLibrary(){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popup.classList.add('active');
}

function closeLibrary(){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove('active');
    popup.classList.remove('active');
}

function getLocal(){
    if(localStorage.getItem('palettes')===null){
        localPalettes=[];
    }
    else{
        const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
        savedPalettes = [...paletteObjects];
        paletteObjects.forEach(paletteObj=>{
            const palette = document.createElement('div');
            palette.classList.add('custom-palette');
            const title = document.createElement('h4');
            title.innerText = paletteObj.name;
            const preview = document.createElement('div');
            preview.classList.add('small-preview');

            paletteObj.colors.forEach(smallColor =>{
                const smallDiv = document.createElement('div');
                smallDiv.style.backgroundColor = smallColor;
                preview.appendChild(smallDiv);
            });

            const paletteBtn = document.createElement('button');
            paletteBtn.classList.add('pick-palette-btn');
            paletteBtn.classList.add(paletteObj.nr);
            console.log(paletteObj.nr);
            paletteBtn.innerText = 'Select';

            paletteBtn.addEventListener("click",e=>{
                closeLibrary();
                // console.log(e)
                const paletteIndex = e.target.classList[1];
                console.log(paletteIndex);
                initialColors = [];
                // console.log(savedPalettes)
                paletteObjects[paletteIndex].colors.forEach((color,index)=>{
                    initialColors.push(color);
                    colorDivs[index].style.backgroundColor = color;
                    const text = colorDivs[index].children[0];
                    checkTextContrast(color,text);
                    updateTextUi(index);
                });
                resetInputs();
            });
            palette.appendChild(title);
            palette.appendChild(preview);
            palette.appendChild(paletteBtn);
            libraryContainer.children[0].appendChild(palette);
        });
    }
}

// localStorage.clear();
getLocal();
randomColors();