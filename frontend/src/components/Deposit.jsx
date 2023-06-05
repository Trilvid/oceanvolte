import React ,{useState,useRef}from 'react'
import Userdashboardheader from './userdashboardheader/Userdashboardheader'
import {MdOutlineContentCopy} from 'react-icons/md'
import {BsImageFill} from 'react-icons/bs'
import {BsUpload} from 'react-icons/bs'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import {FiLink} from 'react-icons/fi'
import {AiOutlineArrowLeft} from 'react-icons/ai'
const Deposit = ({amount,active,close,route}) => {
    const navigate= useNavigate()
    const [Active,setActive] = useState(active)
    const [clipBoard, setClipBoard] = useState(false)
    const [showImage,setShowImage] = useState()
    const clipRef = useRef(null)
    const [modal,setModal] = useState(false)
    const [loader,setLoader] = useState(false)

    // copy to clipboard function starts here 
    const copy = ()=>{
        navigator.clipboard.writeText(clipRef.current.value)
    }

    // upload proof image code starts here 

    const uploadProof = async (file)=>{
        setModal(true)
        console.log(file)
        const formData = new FormData
        formData.append('file',file)
        formData.append('upload_preset','upload');
        const req = await fetch('https://api.cloudinary.com/v1_1/duesyx3zu/image/upload',
          {
          method:'POST',
          body:formData,
        }
        )
        const res = await req.json()
        if(res){
            setShowImage(res.secure_url)
            setModal(false)
        }
    }
    
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })

    // send proof function starts here 

    const sendProof = async()=>{
        setLoader(true)
        const req = await fetch(`${route}/api/sendproof`,{
            method:'POST',
            headers:{
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem('token')
            },
            body:JSON.stringify({
                amount:amount,
                method:Active.method
            })
        })
        const res = await req.json()

        if(res && res.status === 200){
            setLoader(false)
            Toast.fire({
                icon: 'congrats',
                title: `You have successfully placed a deposit of ${amount}`
              })
        }
        else if(res.status === 500){
            Toast.fire({
              icon: 'error',
              title: 'user does not exist'
            })
        }
        else{
            Toast.fire({
                icon: 'error',
                title: 'internal server error'
              })
        }
    }
        
  return (
    <div>
        {
        loader && 
          <div className="wifi-loader-container">
            <div class="loader">
              <span class="l">L</span>
              <span class="o">o</span>
              <span class="a">a</span>
              <span class="d">d</span>
              <span class="i">i</span>
              <span class="n">n</span>
              <span class="g">g</span>
              <span class="d1">.</span>
              <span class="d2">.</span>
            </div>
        </div>
      }
        <Userdashboardheader route={route}/>
        <div className="checkout-page">
                <div className="floating-btn" onClick={()=>{
                    close()
                }}>
                    <AiOutlineArrowLeft />
                </div>
                <h3>deposit confirm</h3>
                <p>confirm your deposit by uploading a proof of payment, after paying</p>
            <div className="checkout-info-container">
                <p>You have requested <span className='bold'>{amount} USD</span> , Please pay <span className='bold'>{amount} USD</span>  for successful payment</p>
                <h3>Please copy Link to copy wallet address and make payment</h3>
                <div className="click-to-copy-container">
                    <button className='clipboard-btn'>
                       <FiLink />
                    </button>
                    <input type="text" value={Active.wallet} ref={clipRef}/>
                    <button className={`clipboard-btn ${clipBoard ? 'copied' : ''}` } onClick={()=>{
                        copy()
                        setClipBoard(!clipBoard)
                    }}>
                        {
                            clipBoard ?
                            'copied!' : <MdOutlineContentCopy />
                        }
                    </button>
                </div>
                <div className="proof-container">
                    <form action="" className='proof-form' onSubmit={(e)=>{
                        e.preventDefault()
                        sendProof()
                    }}>
                        <p>upload proof of payment</p>
                        <div className="proof-img-container">
                            {
                                showImage == undefined &&  !modal ? <BsImageFill /> :<img src={`${showImage}`} alt="" className='proof-image'/> 
                            }
                        </div>
                        <label htmlFor="proof-img" className='proof-label'>
                            <BsUpload />
                            <input type="file" accept='.jpg, .png, .svg, .webp, .jpeg' name="images" id="proof-img" className='proof-input' required onChange={(e)=>{
                                 const image = e.target.files[0]
                                 uploadProof(image)
                            }} />
                        </label>
                        <input type="submit" value="send proof" className='proof-submit-btn' />
                    </form>
                </div>  
            </div>
        </div>
    </div>
  )
}

export default Deposit