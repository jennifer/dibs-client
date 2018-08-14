import React from 'react';
import '../stylesheets/ribbon.css';

const Ribbon = (props) => {
  return <div className="ribbon">
      <h2>{props.heading}</h2>
      <p>{props.subheading}</p>
    </div>;
};

export default Ribbon;
