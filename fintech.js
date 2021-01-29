/*
first
load pdf files

second
read pdf file

third
convert pdf files to images

fourth
use tesseract.js to analyze image text
*/

//
  // The workerSrc property shall be specified.
  //
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'http://mozilla.github.io/pdf.js/build/pdf.worker.js';

//container to hold ALL files
const FILES = {};



// FIRST --- LOAD PDF FILES
//see HTML for event listner hookup
function FileDropHandler(f){
  
    /*
    function support
    https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
    */

    console.log('File(s) dropped');

    // Prevent default behavior (Prevent file from being opened in browser)
    f.preventDefault();

    //reset border color of drop area
    document.getElementById("drop_zone").style.borderColor = "blue";

    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < f.dataTransfer.files.length; i++) {
        //check that it's a PDF, should give user notice if not
        if (f.dataTransfer.files[i].type == "application/pdf"){
            //file name = file data
            //this way user can drop multi files
            FILES[f.dataTransfer.files[i].name] = f.dataTransfer.files[i];
            //console.log('... file[' + i + '].name = ' + f.dataTransfer.files[i].name);

            //console.log(URL.createObjectURL(f.dataTransfer.files[i]));
        }else{alert("Only PDF files are accepted")};
    }
    console.log(FILES);

}

function dragOverHandler(f) {
    console.log('File(s) in drop zone');
  
    // Prevent default behavior (Prevent file from being opened)
    f.preventDefault();

    //change border color to indicate the right file drop area
    document.getElementById("drop_zone").style.borderColor = "green";
  }

  function dragLeave(f){
      //reset border color
    document.getElementById("drop_zone").style.borderColor = "blue";

  }



document.getElementById("ready_to_submit").addEventListener("click", clickHandlerSubmit);

//STEP ONE
//loop through all of the pdf files user uploaded and prepare to present on canvas
function clickHandlerSubmit(){
    t_createFileURLs()
    t_addPagesToFile()
    /*
    createFileURLs()
    .then(()=>{
        //must have the delay as part of the .then() chanin for it to apply
        return delay(stepTwo);
    })
    .catch((e)=>{console.log(e)})
    */
}

function t_createFileURLs(){
    let numProps = Object.keys(FILES).length
    for(const prop in FILES){
        // convert the pdf URL to a loaded pdf, the associate the pages with Files[prop]
        FILES[prop]["pages"] = [];
        let fileURL = URL.createObjectURL(FILES[prop]);
        FILES[prop]["fileURL"] - fileURL;
    }
}

function t_addPagesToFile(){
    //https://github.com/mozilla/pdf.js/blob/master/examples/learning/helloworld.html
    
    for(const prop in FILES){
        let loadingTask = pdfjsLib.getDocument(FILES[prop].fileURL)

        loadingTask.promise.then(function(pdf) {
            
            for(let n = 0; n < pdf.numPages; n++){
                ((n)=>{
                    setTimeout(() => {
                        console.log(n)
                        FILES[prop].pages[n] = pdf.getPage(n+1).catch((e)=>console.log(e,n))
                    }, n*200);
                })(n);
            }
        })
        .catch((error) =>{
            console.log(error);
        });
    }
}


function createFileURLs(){
    
    console.log('createFileURLs');

    return new Promise((resolve,reject)=>{ 
        for (const prop in FILES){
            // convert the pdf URL to a loaded pdf, the associate the pages with Files[prop]
            FILES[prop]["pages"] = [];
            let fileURL = URL.createObjectURL(FILES[prop]);
            addPagesToFile(fileURL,FILES[prop]);
        }
        resolve()
        reject(new Error());
    })
}


/* delay used in waiting for loads
https://stackoverflow.com/questions/39538473/using-settimeout-on-promise-chain
 */
function delay(CalledAfterDelay) {
    return new Promise(() =>{ 
        console.log('delay')
        setTimeout(CalledAfterDelay,1000)
    });
 }

function stepTwo(){
    console.log('stepTwo');

        for (const prop in FILES){
            FILES[prop].pages.forEach((page)=>{
                return delay(pdfPageRender(page))
            })
        }
    //now that FILES has pdfs and their pages, need to start rendering
    //the issue is that rendering takes time and the best solution right now is setTimeout()
    /*
    see this page as example for delay
    https://madhavpalshikar.medium.com/javascript-how-to-wait-in-for-loop-6a4894d6335d
    https://stackoverflow.com/questions/39538473/using-settimeout-on-promise-chain

    */
/*
    console.log(FILES)
   
    for (const prop in FILES){
        console.log(prop)
        processPages(FILES[prop].pages)
   }

    return 1;
    */
}


 
 /* processing function */
async function pageRunner(page){
    await delay();
    pdfPageRender(page);
}

/* here is how you can wait in loop */
async function processPages(pageArray) {
    
    console.log(pageArray);

    pageArray.forEach(async (page) => {
      await pageRunner(page);
      console.log('done with page')
      console.log(page)
    })
    console.log('Completed!!!');
  }


function addPagesToFile(pdf_url,FILE_prop){
    
    //(pdf_url) is objectURL with from user upload, (f) is a FILE from file upload container
    //https://github.com/mozilla/pdf.js/blob/master/examples/learning/helloworld.html
    let loadingTask = pdfjsLib.getDocument(pdf_url)

    loadingTask.promise.then(function(pdf) {
        
        for(let n = 0; n < pdf.numPages; n++){
            FILE_prop.pages[n] = pdf.getPage(n+1)
            .catch((e)=>console.log(e,n))
        }
        
    })
    .catch(function(error) {
		console.log(error);
    });
    
    return;
}

function pdfPageRender(page){
    console.log(page)
    let scale = 1.5;
    let viewport = page.getViewport({ scale: scale, });
        
    // Prepare canvas using PDF page dimensions
    let canvas = document.getElementById('canvas');
    let context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
        
    // Render PDF page into canvas context
    let renderContext = {
            canvasContext: context,
            viewport: viewport,
        };

    page.render(renderContext);

    return true;
}

//fuction to show the pdf on canvas
function showPDF(pdf_url) {
    //https://github.com/mozilla/pdf.js/blob/master/examples/learning/helloworld.html
    let loadingTask = pdfjsLib.getDocument(pdf_url)
    
    loadingTask.promise.then(function(pdf) {
        let TOTAL_PAGES = pdf.numPages;
        console.log(TOTAL_PAGES);
		// Show the first page
        //showPage(1);
        
        //
        // HARD CODE FOR TESTING
        /// 
        //change 2 back to TOTAL_PAGES
        for(let n = 1; n < 2; n++){
            pdf.getPage(n)
            //getPage returns a page
            .then(renderPDFonCanvas)
            //.then(canvasToPNG)
            .then(analyzePNG)
           // .then(analyzePNG_process)
            //.then(clearCanvas)
            .catch((e)=>console.log(e))
        }
        
	}).catch(function(error) {
		// If error re-show the upload button
		console.log(error.message);
	});;
}

function renderPDFonCanvas(page){
        let scale = 5;
        let viewport = page.getViewport({ scale: scale, });
        
        // Prepare canvas using PDF page dimensions
        let canvas = document.getElementById('canvas');
        let context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render PDF page into canvas context
        let renderContext = {
            canvasContext: context,
            viewport: viewport,
        };

        //this is lazy, figure out a way to make rendering wait for the previsous to finish
        page.render(renderContext);

        return canvas;
};

function canvasToPNG(cn){
    //https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
    let canvas = document.getElementById('canvas');
    let context = canvas.getContext('2d');
    console.log('grab image of the canvas as png');

    var png_img_dataURL = canvas.toDataURL('image/png',1.0);//full image

    setTimeout((png_img_dataURL) => {
        analyzePNG(png_img_dataURL);
    }, 100);

    return png_img_dataURL;
}

function clearCanvas(png_img_dataURL){
    let canvas = document.getElementById('canvas');
    let context = canvas.getContext('2d');
    console.log('clearing context')
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    return png_img_dataURL;
}

function analyzePNG(png_img_dataURL){
    //https://github.com/naptha/tesseract.js/blob/a6195ef86d9673cab26120613f53c499b8ec0994/example.htm
    let canvas = document.getElementById('canvas');
    let context = canvas.getContext('2d');
    //png_img_dataURL has to be split so we get rid of the first parta 'data:image/png,
    //Tesseract.recognize(png_img_dataURL)
    Tesseract.recognize(canvas.toDataURL('image/png',1.0))
    .then( (result)=>{
         console.log(result) 
        })
    .finally(()=>{
        console.log('done, ready for next page')
    })

}

function analyzePNG_process(result){
    console.log(result.data);
}

/*
document.getElementById("download").addEventListener("click", downloadPNG);  

function downloadPNG(){
    let canvas = document.getElementById('canvas');
    let btn = document.getElementById('download');
    let context = canvas.getContext('2d');
    var png_img = canvas.toDataURL('image/png',1.0);//full image
    btn.setAttribute('download', 'page.png');
    btn.setAttribute('href', canvas.toDataURL());
    
}
*/