import React, { useContext, useRef } from 'react'
import './Navbar.css'
import logo from '../Assets/Frontend_Assets/logo.png'
import cart_icon from '../Assets/Frontend_Assets/cart_icon.png'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../../Context/ShopContext'
import nav_dropdown from '../Assets/Frontend_Assets/nav_dropdown.png'
import { useAuth0 } from "@auth0/auth0-react";


const Navbar = () => {

    const [menu, setMenu] = useState("shop");
    const {getTotalCartItems} = useContext(ShopContext);
    const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

    const menuRef = useRef();

    const dropdown_toggle = (e) =>{
        menuRef.current.classList.toggle('nav-menu-visible');
        e.targert.classList.toggle('open');
    }


  return (
    <div className="navbar">
        <div className="nav-logo">
            <img src={logo} alt="logo" />
            <p>SHOPPER</p>
        </div>
        <img className='nav-dropdown' onClick={dropdown_toggle}src={nav_dropdown} alt="" />
        <ul ref={menuRef} className="nav-menu">
            <li onClick={()=>{setMenu("shop")}}><Link style={{ textDecoration: 'none'}}to='/'>Shop</Link>{menu==="shop"?<hr />:<></>}</li>
            <li onClick={()=>{setMenu("mens")}}><Link style={{ textDecoration: 'none'}}to='/mens'>Men</Link>{menu==="mens"?<hr />:<></>}</li>
            <li onClick={()=>{setMenu("womens")}}><Link style={{ textDecoration: 'none'}}to='/womens'>Women</Link>{menu==="womens"?<hr />:<></>}</li>
            <li onClick={()=>{setMenu("kids")}}><Link style={{ textDecoration: 'none'}}to='/kids'>Kids</Link>{menu==="kids"?<hr />:<></>}</li>
        </ul>
        <div className="nav-login-cart">
            {isAuthenticated ? (
                <>
                    <span style={{ marginRight: "10px" }}>Hi, {user.name}</span>
                    {isAuthenticated && (
                            <img 
                                src={user.picture} 
                                alt="profile" 
                                style={{ width: 30, height: 30, borderRadius: "50%", marginLeft: "10px" }}
                            />
                            )}

                    <button 
                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                    >
                    Logout
                    </button>
                </>
                ) : localStorage.getItem('auth-token') ? (
                <button 
                    onClick={() => {
                    localStorage.removeItem('auth-token');
                    window.location.replace('/');
                    }}
                >
                    Logout
                </button>
                ) : (
                <button onClick={() => loginWithRedirect()}>Login</button>
                )}

            
            <Link to='/cart'>
                <img src={cart_icon} alt="" />
            </Link>
                <div className="nav-cart-count">{getTotalCartItems()}</div>
        </div>
    </div>
  )
}

export default Navbar