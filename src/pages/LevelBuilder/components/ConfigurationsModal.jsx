import React from 'react';

export const ConfigurationsModal = ({
    showUploadModal, 
    setShowUploadModal, 
    updateLevelDimension,
    updateEditorMap,
}) => {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
        const text = e.target.result;
        const json = JSON.parse(text);
        updateLevelDimension(json.level.width, json.level.height)
        updateEditorMap(
            json.level.width,
            json.level.height,
            json.baseMap,
            json.collisionMap,
            json.objectsMap,
        );
        };
        reader.readAsText(file);
        setShowUploadModal(false);
    }

    const handleCloseClick = () => {
        setShowUploadModal(false);
    };

    return (
        <section className={`${showUploadModal ? 'modal' : 'hide'}`}>
            <div className="modal__content">
                <div className="modal__content--title">Upload Map</div>

                <div style={{padding: "15px 5px"}}>
                    <label htmlFor="uploadFile" className="admin__button">Upload JSON File</label>
                    <input id="uploadFile" type="file" accept="application/json" onChange={(e) => handleFileChange(e)} />
                </div>

                <button className="admin__button" onClick={handleCloseClick}>Cancel</button>
            </div>
        </section>
    );
};