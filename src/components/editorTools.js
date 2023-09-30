import React, { useCallback, useEffect, useState } from 'react'
import { IM_Fell_English } from "@next/font/google"
import { useRouter } from 'next/router'
import Image from 'next/image'
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import Modal from 'react-modal'
import imageCompression from 'browser-image-compression'

import useUserStore from '@/stores/useUserStore'

import Token from './token'

const imFellEnglish = IM_Fell_English({subsets: ["latin"], weight: "400"})

Modal.setAppElement('#__next')

export default function EditorTools(props) {
    const [uploadMapIsFocused, setUploadMapIsFocused] = useState(false)
    const [uploadTokenIsFocused, setUploadTokenIsFocused] = useState(false)
    const [uploadedMap, setUploadedMap] = useState(null)
    const [croppedMap, setCroppedMap] = useState(null)
    const [shouldCropMap, setShouldCropMap] = useState(false)
    const [shouldResetMap, setShouldResetMap] = useState(false)
    const [shouldReCropMap, setShouldRecropMap] = useState(false)
    const [uploadedToken, setUploadedToken] = useState(null)
    const [croppedToken, setCroppedToken] = useState(null)
    const [shouldCropToken, setShouldCropToken] = useState(false)
    const [shouldResetToken, setShouldResetToken] = useState(false)
    const [tokenType, setTokenType] = useState("hostile")
    const [tokenName, setTokenName] = useState("")
    const [cropper, setCropper] = useState(null)
    const [isMapCropperModalOpen, setIsMapCropperModalOpen] = useState(false)
    const [isTokenCropperModalOpen, setIsTokenCropperModalOpen] = useState(false)
    const [isSaveLoadModalOpen, setIsSaveLoadModalOpen] = useState(false)
    const [isSave, setIsSave] = useState(true)
    const [name, setName] = useState("")
    const [mapDelete, setMapDelete] = useState(null)
    const [sectionsOpened, setSectionsOpened] = useState({
        mapPieces: true,
        layout: false,
        upload: false,
        tokens: false
    })

    const router = useRouter()

    const user = useUserStore(state => state.user)
    const setUser = useUserStore(state => state.setUser)

    const handleClickOutside = event => {
        if (event.target.id !== 'fileUploadMapLabel' && event.target.id !== 'fileUploadMap') {
            setUploadMapIsFocused(false);
        }
        if (event.target.id !== 'fileUploadTokenLabel' && event.target.id !== 'fileUploadToken') {
            setUploadTokenIsFocused(false);
        }
    };
      
    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const toggleToolSection = section => {
        sectionsOpened[section] = !sectionsOpened[section]
        setSectionsOpened({...sectionsOpened})
    }

    const handleImageUpload = async (event, type) => {
        const file = event.target.files[0];

        if (file) {
            props.setLoading(true)

            const options = {
                maxSizeMB: 10,
                maxWidthOrHeight: 2000
            }

            const compressedFile = await imageCompression(file, options)
           
            const reader = new FileReader();

            if (type === "map") {
                reader.onloadend = () => {
                    setUploadedMap(reader.result);
                    setCroppedMap(reader.result);
                    setIsMapCropperModalOpen(true)
                };
            }
            else if (type === "token") {
                reader.onloadend = () => {
                    setUploadedToken(reader.result);
                    setCroppedToken(reader.result);
                    setIsTokenCropperModalOpen(true)
                };
            }
            reader.readAsDataURL(compressedFile);
        }
        event.target.value = null
    };
    
    const cropImage = type => {
        props.setLoading(true)
        type === "map" ? setShouldCropMap(true) : setShouldCropToken(true)
    };
    
    useEffect(() => {
        if (shouldCropMap || shouldCropToken) {
            setTimeout(() => {
                if (cropper) {
                    setCroppedMap(cropper.getCroppedCanvas().toDataURL());
                    setCroppedToken(cropper.getCroppedCanvas().toDataURL());
                }
                setShouldCropMap(false)
                setShouldCropToken(false)
            }, 0)
        }
    }, [shouldCropMap, shouldCropToken])

    const resetCrop = type => {
        props.setLoading(true)
        type === "map" ? setShouldResetMap(true) : setShouldResetToken(true)
    }
    
    useEffect(() => {
        if (shouldResetMap || shouldResetToken) {
            setTimeout(() => {
                if (cropper) {
                    cropper.reset()
                    setCroppedMap(uploadedMap)
                    setCroppedToken(uploadedToken)
                }
                setShouldResetMap(false)
                setShouldResetToken(false)
            }, 0)
        }
    }, [shouldResetMap, shouldResetToken])

    const acceptMap = () => {
        props.setMapImage(croppedMap)
        setCroppedMap(null)
        setUploadedMap(null)
        setIsMapCropperModalOpen(false)
    }
    
    const cancelMap = () => {
        setCroppedMap(null)
        setUploadedMap(null)
        setIsMapCropperModalOpen(false)
    }

    const acceptToken = async () => {
        props.setLoading(true)

        let image = null

        const form = new FormData()
        form.append("file", croppedToken)
        form.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)

        const cloudinaryData = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload`, {
            method: "POST",
            body: form
        })
        .then(response => response.json())
        .catch(error => console.log("Error uploading token:", error))

        if (cloudinaryData.error) console.log(cloudinaryData.error.message)
        else image = cloudinaryData.url

        if (image) {
            const data = await fetch("https://arcaneatlasapi.up.railway.app/token/add", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    name: tokenName,
                    stance: tokenType,
                    image,
                    user_id: user.id
                })
            })
            .then(response => response.json())
            .catch(error => console.log("Error saving token:", error))
    
            if (data && data.status !== 200) console.log(data.message)
            else if (data) {
                user.tokens.push(data.data.token)
                setUser({...user})
                setUploadedToken(null)
                setCroppedToken(null)
                setIsTokenCropperModalOpen(false)
                setTokenName("")
                setTokenType("hostile")
            }
        }

        props.setLoading(false)
    }
    
    const cancelToken = () => {
        setCroppedToken(null)
        setUploadedToken(null)
        setTokenType("hostile")
        setTokenName("")
        setIsTokenCropperModalOpen(false)
    }

    const reCropMap = () => {
        props.setLoading(true)
        setShouldRecropMap(true)
    }
    
    useEffect(() => {
        if (shouldReCropMap) {
            setTimeout(() => {
                setUploadedMap(props.mapImage);
                setCroppedMap(props.mapImage);
                setIsMapCropperModalOpen(true)
                setShouldRecropMap(false)
            }, 0)
        }
    }, [shouldReCropMap])

    const onCropperInit = useCallback((instance) => {
        setCropper(instance);
        props.setLoading(false)
    }, []);

    const onCropperCrop = useCallback(() => {
        props.setLoading(false)
    }, []);

    const buildTokens = () => user.tokens.map(token => (
        <Token key={`token-${token.id}`} token={token} />
    ))

    const handleSave = () => {
        setIsSaveLoadModalOpen(true)
        setIsSave(true)
    }

    const handleSaveSubmit = async () => {
        props.setLoading(true)

        const layout = {
            columns: props.columns,
            rows: props.rows,
            mapWidth: props.mapWidth,
            mapHeight: props.mapHeight,
            mapOffsetX: props.mapOffsetX,
            mapOffsetY: props.mapOffsetY
        }
        let image = null

        if (props.mapImage) {
            const form = new FormData()
            form.append("file", props.mapImage)
            form.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)

            const cloudinaryData = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload`, {
                method: "POST",
                body: form
            })
            .then(response => response.json())
            .catch(error => console.log("Error uploading map:", error))

            if (cloudinaryData.error) console.log(cloudinaryData.error.message)
            else image = cloudinaryData.url
        }

        const data = await fetch("https://arcaneatlasapi.up.railway.app/map/add", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                name,
                layout,
                pieces: props.mapPieces,
                image,
                user_id: user.id
            })
        })
        .then(response => response.json())
        .catch(error => console.log("Error saving map:", error))

        if (data && data.status !== 200) console.log(data.message)
        else if (data) {
            user.maps.push(data.data.map)
            setUser({...user})
            setIsSaveLoadModalOpen(false)
            setName("")
        }

        props.setLoading(false)
    }

    const handleLoad = () => {
        setIsSaveLoadModalOpen(true)
        setIsSave(false)
    }

    const handleLoadSubmit = () => {
        const map = user.maps.filter(map => map.name === name)[0]

        props.setMapPieces(map.pieces)

        props.setColumns(map.layout.columns)
        props.setRows(map.layout.rows)
        props.setMapWidth(map.layout.mapWidth)
        props.setMapHeight(map.layout.mapHeight)
        props.setMapOffsetX(map.layout.mapOffsetX)
        props.setMapOffsetY(map.layout.setMapOffsetY)

        if (map.image) {
            props.setMapImage(map.image)
        }

        setIsSaveLoadModalOpen(false)
        setName("")
    }

    const handleSaveLoadCancel = () => {
        setIsSaveLoadModalOpen(false)
        setName("")
    }

    const handleMapClick = (event, map) => {
        if (event.target.className !== "map-delete") {
            setName(map.name)
        }
        else {
            setMapDelete(map)
        }
    }

    const handleMapDelete = () => {
        user.maps = user.maps.filter(map => map.id !== mapDelete.id)
        setUser({...user})

        fetch(`https://arcaneatlasapi.up.railway.app/map/delete/${mapDelete.id}`, { method: "DELETE" })
        .catch(error => console.log("Error deleting map:", error))

        setMapDelete(null)
    }

    return (
        <div className={`tools-wrapper editor-tools-wrapper ${imFellEnglish.className}`}>
            <span className="back-button" onClick={() => router.push("/")}>&#10163;</span>

            <h3 onClick={() => toggleToolSection("mapPieces")}>Map Pieces</h3>

            <div className={`tools-section map-pieces-wrapper ${sectionsOpened.mapPieces ? "opened" : ""}`}>
                <span className={`map-piece custom-tooltip wall ${props.selectedTool === "wall" ? "selected" : ""}`} onClick={() => props.setSelectedTool("wall")}>
                    <svg width="28" height="36" xmlns="http://www.w3.org/2000/svg" >
                        <rect x="0" y="0" width="12" height="11" fill="#8B8B8B" stroke="#000" strokeWidth="1"/>
                        <rect x="13" y="0" width="12" height="11" fill="#8B8B8B" stroke="#000" strokeWidth="1"/>
                        
                        <rect x="0" y="12" width="18" height="11" fill="#8B8B8B" stroke="#000" strokeWidth="1"/>
                        <rect x="19" y="12" width="6" height="11" fill="#8B8B8B" stroke="#000" strokeWidth="1"/>
                        
                        <rect x="0" y="24" width="12" height="11" fill="#8B8B8B" stroke="#000" strokeWidth="1"/>
                        <rect x="13" y="24" width="12" height="11" fill="#8B8B8B" stroke="#000" strokeWidth="1"/>
                    </svg>
                    <div className="tooltip-text">Wall</div>
                </span>
                <span className={`map-piece door custom-tooltip ${props.selectedTool === "door" ? "selected" : ""}`} onClick={() => props.setSelectedTool("door")}>
                    <svg width="28" height="36" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="28" height="36" fill="#8B4513" stroke="#000" strokeWidth="1"/>
                        
                        <rect x="1" y="0" width="5" height="36" fill="#A0522D" stroke="#000" strokeWidth="1"/>
                        <rect x="8" y="0" width="5" height="36" fill="#A0522D" stroke="#000" strokeWidth="1"/>
                        <rect x="15" y="0" width="5" height="36" fill="#A0522D" stroke="#000" strokeWidth="1"/>
                        <rect x="22" y="0" width="5" height="36" fill="#A0522D" stroke="#000" strokeWidth="1"/>
                        
                        <rect x="1" y="12" width="26" height="3" fill="#8B4513" stroke="#000" strokeWidth="1"/>
                        <rect x="1" y="22" width="26" height="3" fill="#8B4513" stroke="#000" strokeWidth="1"/>
                        
                        <circle cx="24" cy="18" r="2" fill="#000" />
                    </svg>
                    <div className="tooltip-text">Door</div>
                </span>
                <span className={`map-piece hidden-door custom-tooltip ${props.selectedTool === "hidden-door" ? "selected" : ""}`} onClick={() => props.setSelectedTool("hidden-door")}>
                    <svg width="28" height="36" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="28" height="36" fill="#8B4513" stroke="#000" strokeWidth="1"/>
                        
                        <rect x="1" y="0" width="5" height="36" fill="#7A3D28" stroke="#000" strokeWidth="1"/>
                        <rect x="8" y="0" width="5" height="36" fill="#7A3D28" stroke="#000" strokeWidth="1"/>
                        <rect x="15" y="0" width="5" height="36" fill="#7A3D28" stroke="#000" strokeWidth="1"/>
                        <rect x="22" y="0" width="5" height="36" fill="#7A3D28" stroke="#000" strokeWidth="1"/>
                        
                        <rect x="1" y="12" width="26" height="3" fill="#724832" stroke="#000" strokeWidth="1"/>
                        <rect x="1" y="22" width="26" height="3" fill="#724832" stroke="#000" strokeWidth="1"/>
                        
                        <circle cx="24" cy="18" r="2" fill="#000" />
                        
                        <text x="8" y="20" fontFamily="Arial, sans-serif" fontSize="19" fontWeight="bold" fill="#000" stroke="#FFF" strokeWidth="1">?</text>
                    </svg>
                    <div className="tooltip-text">Hidden Door</div>
                </span>
                <span className={`map-piece window custom-tooltip ${props.selectedTool === "window" ? "selected" : ""}`} onClick={() => props.setSelectedTool("window")}>
                    <svg width="28" height="36" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="28" height="36" fill="#8B4513" stroke="#000" strokeWidth="1"/>
                        
                        <rect x="2" y="2" width="24" height="32" fill="#dcb995" stroke="#000" strokeWidth="1"/>
                        
                        <rect x="13" y="2" width="2" height="32" fill="#8B4513" stroke="#000" strokeWidth="1"/>
                        
                        <rect x="2" y="17" width="24" height="3" fill="#8B4513" stroke="#000" strokeWidth="1"/>
                    </svg>
                    <div className="tooltip-text">Window</div>
                </span>
                <span className={`map-piece hidden-window custom-tooltip ${props.selectedTool === "hidden-window" ? "selected" : ""}`} onClick={() => props.setSelectedTool("hidden-window")}>
                    <svg width="28" height="36" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="28" height="36" fill="#8B4513" stroke="#000" strokeWidth="1"/>
                        
                        <rect x="2" y="2" width="24" height="32" fill="#7A3D28" stroke="#000" strokeWidth="1"/>
                        
                        <rect x="13" y="2" width="2" height="32" fill="#724832" stroke="#000" strokeWidth="1"/>
                        
                        <rect x="2" y="17" width="24" height="3" fill="#724832" stroke="#000" strokeWidth="1"/>
                        
                        <text x="8" y="20" fontFamily="Arial, sans-serif" fontSize="19" fontWeight="bold" fill="#000" stroke="#FFF" strokeWidth="1">?</text>
                    </svg>
                    <div className="tooltip-text">Hidden Window</div>
                </span>
                <span className={`map-piece trap custom-tooltip ${props.selectedTool === "trap" ? "selected" : ""}`} onClick={() => props.setSelectedTool("trap")}>
                    <svg width="28" height="36" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="28" height="36" fill="#7A3E15" stroke="#000" strokeWidth="1"/>
                        
                        <polygon points="0,36 4,16 9,36" fill="#AB2B30" stroke="#000" strokeWidth="1"/>
                        <polygon points="9,36 13,16 18,36" fill="#AB2B30" stroke="#000" strokeWidth="1"/>
                        <polygon points="18,36 22,16 28,36" fill="#AB2B30" stroke="#000" strokeWidth="1"/>
                        
                        <text x="50%" y="20" fontFamily="Arial, sans-serif" fontSize="19" fontWeight="bold" fill="#000" stroke="#FFF" strokeWidth="1" textAnchor="middle">!</text>
                    </svg>
                    <div className="tooltip-text">Trap</div>
                </span>
                <span className={`map-piece secret custom-tooltip ${props.selectedTool === "secret" ? "selected" : ""}`} onClick={() => props.setSelectedTool("secret")}>
                    <svg width="28" height="36" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="28" height="4" fill="#8B4513" stroke="#000" strokeWidth="1"/>
                        <rect x="0" y="32" width="28" height="4" fill="#8B4513" stroke="#000" strokeWidth="1"/>
                        
                        <rect x="2" y="0" width="24" height="36" fill="#dcb995" stroke="#000" strokeWidth="1" rx="3" ry="3"/>
                        
                        <text x="8" y="20" fontFamily="Arial, sans-serif" fontSize="19" fontWeight="bold" fill="#000" stroke="#FFF" strokeWidth="1">?</text>
                    </svg>
                    <div className="tooltip-text">Secret</div>
                </span>
                <span className={`map-piece dim-light custom-tooltip ${props.selectedTool === "dim-light" ? "selected" : ""}`} onClick={() => props.setSelectedTool("dim-light")}>
                    <svg width="28" height="36" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="28" height="36" fill="#A9A9A9" stroke="#000" strokeWidth="1"/>
                        
                        <circle cx="14" cy="14" r="6" fill="#B0C4DE" stroke="#000" strokeWidth="1"/>
                        <circle cx="12" cy="10" r="1" fill="#B0C4DE" />
                        <circle cx="16" cy="10" r="1" fill="#B0C4DE" />
                        <circle cx="14" cy="18" r="1" fill="#B0C4DE" />
                        <circle cx="18" cy="14" r="1" fill="#B0C4DE" />
                        <circle cx="10" cy="14" r="1" fill="#B0C4DE" />
                    </svg>
                    <div className="tooltip-text">Dim Light</div>
                </span>
                <span className={`map-piece darkness custom-tooltip ${props.selectedTool === "darkness" ? "selected" : ""}`} onClick={() => props.setSelectedTool("darkness")}>
                    <svg width="28" height="36" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="28" height="36" fill="#000000" stroke="#000" strokeWidth="1"/>
                        
                        <circle cx="14" cy="14" r="6" fill="#2C2C2C" stroke="#000" strokeWidth="1"/>
                        <circle cx="12" cy="10" r="1" fill="#2C2C2C" />
                        <circle cx="16" cy="10" r="1" fill="#2C2C2C" />
                        <circle cx="14" cy="18" r="1" fill="#2C2C2C" />
                        <circle cx="18" cy="14" r="1" fill="#2C2C2C" />
                        <circle cx="10" cy="14" r="1" fill="#2C2C2C" />
                    </svg>
                    <div className="tooltip-text">Darkness</div>
                </span>
            </div>

            <hr />

            <h3 onClick={() => toggleToolSection("layout")}>Layout</h3>

            <div className={`tools-section layout-wrapper ${sectionsOpened.layout ? "opened" : ""}`}>
                <h4>Grid</h4>

                <div className="grid-layout-wrapper">
                    <label className={imFellEnglish.className}>
                        Columns
                        <input type="number" defaultValue={props.columns} onChange={event => props.setColumns(event.target.valueAsNumber || 0)} />
                    </label>
                    <label className={imFellEnglish.className}>
                        Rows
                        <input type="number" defaultValue={props.rows} onChange={event => props.setRows(event.target.valueAsNumber || 0)} />
                    </label>
                </div>

                <h4 className={`${!props.mapImage ? "disabled" : ""}`}>Map</h4>

                <div className="map-layout-wrapper">
                    <label className={`${imFellEnglish.className} ${!props.mapImage ? "disabled" : ""}`}>
                        Width
                        <input disabled={!props.mapImage} type="number" defaultValue={props.mapWidth} onChange={event => props.setMapWidth(event.target.valueAsNumber || 0)} />
                    </label>
                    <label className={`${imFellEnglish.className} ${!props.mapImage ? "disabled" : ""}`}>
                        Height
                        <input disabled={!props.mapImage} type="number" defaultValue={props.mapHeight} onChange={event => props.setMapHeight(event.target.valueAsNumber || 0)} />
                    </label>

                    <label className={`${imFellEnglish.className} ${!props.mapImage ? "disabled" : ""}`}>
                        Offset X
                        <input disabled={!props.mapImage} type="number" defaultValue={props.mapOffsetX} onChange={event => props.setMapOffsetX(event.target.valueAsNumber || 0)} />
                    </label>
                    <label className={`${imFellEnglish.className} ${!props.mapImage ? "disabled" : ""}`}>
                        Offset Y
                        <input disabled={!props.mapImage} type="number" defaultValue={props.mapOffsetY} onChange={event => props.setMapOffsetY(event.target.valueAsNumber || 0)} />
                    </label>
                </div>
            </div>

            <hr />

            <h3 onClick={() => toggleToolSection("upload")}>Upload</h3>

            <div className={`tools-section upload-wrapper ${sectionsOpened.upload ? "opened" : ""}`}>
                <div className="upload-input">
                    <label 
                        id="fileUploadMapLabel"
                        htmlFor="fileUploadMap" 
                        className={`custom-file-upload ${uploadMapIsFocused ? 'focused' : ''}`} 
                        onClick={() => setUploadMapIsFocused(true)} 
                    >
                        Upload&nbsp;Map
                    </label>
                    <input type="file" id="fileUploadMap" onChange={event => handleImageUpload(event, "map")} />
                </div>

                <div className="upload-input">
                    <label 
                        id="fileUploadTokenLabel"
                        htmlFor="fileUploadToken" 
                        className={`custom-file-upload ${uploadTokenIsFocused ? 'focused' : ''}`} 
                        onClick={() => setUploadTokenIsFocused(true)} 
                    >
                        Upload&nbsp;Token
                    </label>
                    <input type="file" id="fileUploadToken" onChange={event => handleImageUpload(event, "token")} />
                </div>

                <button disabled={!props.mapImage} onClick={reCropMap}>Crop Map</button>
                <button disabled={!props.mapImage} onClick={() => props.setMapImage(null)}>Clear Map</button>
            </div>

            <hr />

            <h3 onClick={() => toggleToolSection("tokens")}>Tokens</h3>

            <div className={`tools-section tokens-wrapper ${sectionsOpened.tokens ? "opened" : ""}`}>
                <div className={`tokens-container ${user.tokens.length ? "active" : "empty"}`}>
                    {user.tokens.length
                        ? buildTokens()
                        : "None"
                    }
                </div>
            </div>

            <hr />

            <div className="save-wrapper">
                <button onClick={handleSave}>Save</button>
                <button onClick={handleLoad}>Load</button>
            </div>

            <Modal
                isOpen={isMapCropperModalOpen}
                onRequestClose={() => setIsMapCropperModalOpen(false)}
                shouldCloseOnOverlayClick={false}
                overlayClassName="react-modal-overlay"
                className="react-modal-content"
            >
                <Cropper
                    src={croppedMap}
                    style={{ height: "60vh" }}
                    aspectRatio={NaN} 
                    autoCropArea={1}
                    viewMode={2}
                    guides={false}
                    preview=".img-preview"
                    onInitialized={onCropperInit}
                    crop={onCropperCrop}
                />

                <div className="cropper-buttons">
                    <button onClick={() => cropImage("map")}>Crop Image</button>
                    <button onClick={() => resetCrop("map")}>Reset Image</button>
                    <button onClick={acceptMap}>Accept</button>
                    <button onClick={cancelMap}>Cancel</button>
                </div>
            </Modal>

            <Modal
                isOpen={isTokenCropperModalOpen}
                onRequestClose={() => setIsTokenCropperModalOpen(false)}
                shouldCloseOnOverlayClick={false}
                overlayClassName="react-modal-overlay"
                className="react-modal-content"
            >
                <div className="cropper-preview-wrapper">

                    <Cropper
                        src={croppedToken}
                        style={{ height: "60vh", width: "50%" }}
                        aspectRatio={NaN} 
                        autoCropArea={1}
                        viewMode={2}
                        guides={false}
                        preview=".img-preview"
                        onInitialized={onCropperInit}
                        crop={onCropperCrop}
                    />

                    <div className="token-preview">
                        <h3 className={imFellEnglish.className}>Name</h3>
                        <input type="text" placeholder='Token Name' onChange={event => setTokenName(event.target.value)} />
                        <h3 className={imFellEnglish.className}>Type</h3>
                        <div className="token-type-buttons">
                            <button className={`token-type-button ${tokenType === "hostile" ? "selected" : ""}`} onClick={() => setTokenType("hostile")}>Hostile</button>
                            <button className={`token-type-button ${tokenType === "neutral" ? "selected" : ""}`} onClick={() => setTokenType("neutral")}>Neutral</button>
                            <button className={`token-type-button ${tokenType === "friendly" ? "selected" : ""}`} onClick={() => setTokenType("friendly")}>Friendly</button>
                            <button className={`token-type-button ${tokenType === "unknown" ? "selected" : ""}`} onClick={() => setTokenType("unknown")}>Unknown</button>
                            <button className={`token-type-button ${tokenType === "player" ? "selected" : ""}`} onClick={() => setTokenType("player")}>Player</button>
                        </div>
                        <h3 className={imFellEnglish.className}>Preview</h3>
                        {croppedToken && <Image src={croppedToken} className={`token ${tokenType}`} width="50" height="50" alt='token' />}
                    </div>
                </div>

                <div className="cropper-buttons">
                    <button onClick={() => cropImage("token")}>Crop Image</button>
                    <button onClick={() => resetCrop("token")}>Reset Image</button>
                    <button onClick={acceptToken} disabled={!tokenName ? true : false}>Accept</button>
                    <button onClick={cancelToken}>Cancel</button>
                </div>
            </Modal>

            <Modal
                isOpen={isSaveLoadModalOpen}
                onRequestClose={() => setIsSaveLoadModalOpen(false)}
                shouldCloseOnOverlayClick={false}
                overlayClassName="react-modal-overlay"
                className="react-modal-content"
            >
                <h3>{isSave ? "Save" : "Load"}</h3>

                <div className="maps-wrapper">
                    {user?.maps?.map(map => (
                        <span key={map.id} className='map' onClick={event => handleMapClick(event, map)}>
                            <span className='map-name'>{map.name}</span>
                            <span className='map-delete'>&#x1F5D1;&#xFE0F;</span>
                        </span>
                    ))}
                </div>

                <div className="save-load-buttons">
                    <input type="text" placeholder='Map Name' value={name} onChange={event => setName(event.target.value)} />
                    <button onClick={isSave ? handleSaveSubmit : handleLoadSubmit} disabled={!name ? true : false}>{isSave ? "Save" : "Load"}</button>
                    <button onClick={handleSaveLoadCancel}>Cancel</button>
                </div>

                {mapDelete &&
                    <div className="map-delete-confirm">
                        <div className="map-delete-content">
                            <h3>Are you sure you want to delete {mapDelete.name}?</h3>
                            <div className="delete-buttons">
                                <button onClick={handleMapDelete}>Delete</button>
                                <button onClick={() => setMapDelete(null)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                }
            </Modal>
        </div>
    )
}