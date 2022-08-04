import { useState, useRef } from 'react'
import * as ml5 from 'ml5'
import classes from './App.module.css'

function App() {

  const imageRef = useRef()
  const fileRef = useRef()
  
  const [loadState, setLoadState] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [resultItems, setResultItems] = useState([])

  const getImageClassifier = async () => {

    return await ml5.imageClassifier('MobileNet').then(classifier => classifier.predict(imageRef.current))

  }

  const processImage = () => {

    getImageClassifier().then(result => {

      console.log(result)

      setResultItems(result)

      setLoadState(2)

    }).catch(error => {

      setErrorMsg(JSON.stringify(error))

      setLoadState(2)

    })

  }

  const handleFileLoad = () => {
    
    const files = fileRef.current.files;

    let fileBlob

    for (let i = 0; i < files.length; i++) {
      var file = files[i]
      if(!file || !file.type.match(/image\/.*/)) continue
      fileBlob = file
    }

    const reader = new FileReader()
          
    reader.onload = (() => {
      return function(e) {

        const tmpImage = new Image()

        tmpImage.onload = function() {

          setLoadState(1)
          
          imageRef.current.src = tmpImage.src

          processImage()

        }
        
        tmpImage.onerror = function() {
          
          setLoadState(2)

          setErrorMsg("Error loading image")

        }

        tmpImage.src = e.target.result

      }
    })(fileBlob)

    reader.readAsDataURL(fileBlob)


  }

  const handleLoadImage = () => {

    fileRef.current.click()

  }

  return (
    <div className={classes.container}>
      <div className={classes.main}>
        <div className={classes.imageContainer}>
          <img ref={imageRef} className={classes.image} />
          <div className={classes.overlay}>
            {
              loadState === 0 &&
              <span className={classes.ready}>Please select or take an image to start.</span>
            }
            {
              loadState === 1 &&
              <span className={classes.status}>Processing image...</span>
            }
            {
              (loadState === 2 && errorMsg) &&
              <span className={classes.error}>{errorMsg}</span>
            }
            {
              loadState === 2 &&
              <div className={classes.result}>
                <table className={classes.table}>
                  <tbody>
                  {
                    resultItems.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{item.label}</td>
                          <td>{item.confidence.toFixed(2)}</td>
                        </tr>
                      )
                    })
                  }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
        <div className={classes.control}>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileLoad} />
          <button disabled={loadState === 1} onClick={handleLoadImage}>Load Image</button>
        </div>
      </div>
    </div>
  )
}

export default App
