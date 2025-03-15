import React from 'react'
import { Outlet, useNavigate } from 'react-router'
import { useAppSelector } from '../../store'

export default function DashboardLayout() {

  const user = useAppSelector(state=>state.app.user);
  const navigate = useNavigate(); 

  React.useEffect(()=>{
    if(!user) navigate('/auth/login');
  }, [user])

  return (
    <Outlet/>
  )
}
