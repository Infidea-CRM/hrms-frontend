import React, { useEffect, useState } from "react";
import { quantum } from "ldrs";

quantum.register(); // Register the loader

const Loader = ({ size = "45", speed = "1.75" }) => {
    
    return (
        <div className="flex justify-center mt-4">
            <l-quantum 
                size={size} 
                speed={speed} 
                color={"#e2692c"}//emerald - color
            ></l-quantum>
        </div>
    );
};

export default Loader;