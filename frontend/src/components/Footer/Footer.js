import React from "react";
import FooterIcon from "../Icons/FooterIcon.js";
import s from "./Footer.module.scss";

const Footer = () => {
  return (
    <div className={s.footer}>
      <span className={s.footerLabel}>2025 &copy; Guido Magi | All rights reserved.</span>
    </div>
  )
}

export default Footer;
