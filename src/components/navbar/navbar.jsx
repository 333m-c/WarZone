import React from 'react'
import { NavLink } from 'react-router-dom'
import style from './navbar.module.css'

export default function Navbar() {
  return (
    <div className={style.container}>
      <NavLink
        to="/offence"
        className={({ isActive }) =>
          `${style.link} ${isActive ? style.offenceActive : ''}`
        }
      >
        OFFENCE
      </NavLink>

      <NavLink
        to="/overall"
        end
        className={({ isActive }) =>
          `${style.link} ${isActive ? style.overallActive : ''}`
        }
      >
        OVERALL
      </NavLink>

      <NavLink
        to="/defence"
        className={({ isActive }) =>
          `${style.link} ${isActive ? style.defenceActive : ''}`
        }
      >
        DEFENCE
      </NavLink>
    </div>
  )
}
