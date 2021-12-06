import React from "react";
import "./toggler.css";
import cx from "classnames";

const toggler = ( { rounded = false, onToggle }) => {

    const sliderCX = cx('slider', {
        'rounded': rounded
    })

    function getText() {
        onToggle();
        var x = document.getElementById("toggleText");
        if (x.innerHTML === 'Light Mode') {
            x.innerHTML = "Dark Mode";
            x.style.color = "white";
        }
        else {
            x.innerHTML = "Light Mode";
            x.style.color = "black";
        }
    }

    return (
        <label className="toggler">
            <input type="checkbox" onChange={getText}/>
            <span className={sliderCX}/>
            <p id="toggleText">Light Mode</p>
        </label>
    );
};

export default toggler;