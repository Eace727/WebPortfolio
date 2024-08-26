/* eslint-disable no-unused-vars */
import React from 'react'
import './Navbar.css'

function Navbar() {
    return (
        <nav className="navbar">
            <ul className="navbar-ul">
                <li className="navbar-li">
                    <a href="/" className="navbar-a">Home</a>
                </li>
                <li className="navbar-li">
                    <a href="/about" className="navbar-a">About</a>
                </li>
                <li className="navbar-li">
                    <a href="/projects" className="navbar-a">Projects</a>
                </li>
                <li className="navbar-li">
                    <a href="/contact" className="navbar-a">Contact</a>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;