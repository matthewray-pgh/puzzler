import React from 'react';

export const ConfigurationsModal = ({
    level,
    baseMap,
    collisionMap,
    showUploadModal, 
    setShowUploadModal, 
    handleInputChange,
    handleMapCreate,
    handleGenerateClick,
    handleDownloadClick,
    handleCancelClick,
    handleResetClick,
    updateLevelDimension,
    updateBaseMap,
    updateCollisionMap
}) => {
    const resetForm = () => {
        handleResetClick();
        setShowUploadModal(false);
    }

    const handleFileChange = (e) => {
        resetForm();
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
        const text = e.target.result;
        const json = JSON.parse(text);
        updateLevelDimension(json.level.width, json.level.height)
        updateBaseMap(JSON.stringify(json.baseMap));
        updateCollisionMap(JSON.stringify(json.collisionMap));
        };
        reader.readAsText(file);
    }

    const handleUploadClick = () => {
        handleMapCreate(level.x, level.y, baseMap, collisionMap);
        resetForm();
        handleGenerateClick();
    };

    const handleCloseClick = () => {
        setShowUploadModal(false);
    };

    return (
        <div className={`${showUploadModal ? 'modal' : 'hide'}`}>
        <div className="modal__content">
            <div className="modal__content--title">Configuration Settings</div>

            <div style={{padding: "10px 5px", marginBottom: "10px"}}>
                <label htmlFor="uploadFile" className="admin__button">Upload JSON File</label>
                <input id="uploadFile" type="file" accept="application/json" onChange={(e) => handleFileChange(e)} />
            </div>

            <section className="admin__upload-form panel" >
                <h3>Level Details</h3>
            <div className="admin__upload-form--side-by-side">
                <div>
                    <label htmlFor="x" className="admin__label">Width</label>
                    <input 
                        name="x" 
                        type="number" 
                        placeholder="Enter Width"
                        className="admin__input"
                        value={level.x}
                        onChange={(e) => handleInputChange(e)}
                    />
                </div>
                
                <div>
                    <label htmlFor="y" className="admin__label">Height</label>
                    <input 
                        name="y" 
                        type="number" 
                        placeholder="Enter Height"
                        className="admin__input"
                        value={level.y}
                        onChange={(e) => handleInputChange(e)}
                    />
                </div>
            </div>

            <label htmlFor="baseMap" className="admin__label">Base Map JSON</label>
            <textarea
                name="baseMap"
                placeholder="Enter Base Map JSON"
                className="admin__input"
                value={baseMap}
                onChange={(e) => updateBaseMap(e.target.value)}
            />

            <label htmlFor="collisionMap" className="admin__label">Collision Map JSON</label>
            <textarea
                name="collisionMap"
                placeholder="Enter Collision Map JSON"
                className="admin__input"
                value={collisionMap}
                onChange={(e) => updateCollisionMap(e.target.value)}
            />
            </section>

            <div className="modal__content--button-panel">
                <button className="admin__button" onClick={handleUploadClick}>Generate</button>
                <button className="admin__button" onClick={handleCancelClick}>Cancel</button>
            </div>
        </div>
        </div>
    );
};