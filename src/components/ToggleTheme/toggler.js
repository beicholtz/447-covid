import React from "react";
import "./toggler.css";
import cx from "classnames";

const toggler = ( { rounded = false, onToggle }) => {

    const sliderCX = cx('slider', {
        'rounded': rounded
    })

    return (
        <label className="toggler">
            <input type="checkbox" onChange={onToggle}/>
            <span className={sliderCX}/>
            
        </label>
    );
};

export default toggler;