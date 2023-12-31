import { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { NavBar } from './components/NavBar'
import { Routing } from './router/Routing'
import { getJwt, getUser } from './services/userServices'
import { setAuthToken } from './utils/setAuthToken'
import { addToCartAPI, decreaseProductAPI, getCartAPI, increaseProductAPI, removeFromCartAPI } from './services/cartServices'
import 'react-toastify/dist/ReactToastify.css'
import { UserContext } from './contexts/UserContext'
import { CartContext } from './contexts/CartContext'

setAuthToken(getJwt())

export const App = () => {
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState([])
  useEffect(() => {
    try {
      const jwtUser = getUser()
      if (Date.now() >= jwtUser.exp * 1000) {
        window.localStorage.removeItem('token')
        window.location.reload()
      } else {
        setUser(jwtUser)
      }
    } catch (error) {}
  }, [])

  const addToCart = (product, quantity) => {
    const updatedCart = [...cart]
    const productIndex = updatedCart.findIndex(item => item.product._id === product._id)

    if (productIndex === -1) {
      updatedCart.push({ product, quantity })
    } else {
      updatedCart[productIndex].quantity += quantity
    }
    setCart(updatedCart)
    addToCartAPI(product._id, quantity)
      .then(res => {
        toast.success('Product Added Succesfully')
      })
      .catch(() => {
        toast.error('Failed to add product!')
        setCart(cart)
      })
  }

  const removeFromCart = (id) => {
    const oldCart = [...cart]
    const newCart = oldCart.filter(item => item.product._id !== id)
    setCart(newCart)
    removeFromCartAPI(id)
      .catch(() => {
        toast.error('Something went wrong!')
        setCart(oldCart)
      })
  }

  const updateCart = (type, id) => {
    const oldCart = [...cart]
    const updateCart = [...cart]
    const productIndex = updateCart.findIndex(item => item.product._id === id)
    if (type === 'increase') {
      updateCart[productIndex].quantity += 1
      setCart(updateCart)
      increaseProductAPI(id)
        .catch(() => {
          toast.error('Something went wrong!')
          setCart(oldCart)
        })
    } if (type === 'decrease') {
      updateCart[productIndex].quantity -= 1
      setCart(updateCart)
      decreaseProductAPI(id)
        .catch(() => {
          toast.error('Something went wrong!')
          setCart(oldCart)
        })
    }
  }

  const getCart = () => {
    getCartAPI()
      .then(res => {
        setCart(res.data)
      })
      .catch(() => {
        toast.error('Something went wrong!')
      })
  }

  useEffect(() => {
    if (user) {
      getCart()
    }
  }, [user])

  return (
    <UserContext.Provider value={user}>
      <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCart, setCart }}>
        <div className='grid grid-rows-[80px] auto-rows-auto font-montserrat'>
          <NavBar />
          <main className=''>
            <ToastContainer position='bottom-right' />
            <Routing />
          </main>
        </div>
      </CartContext.Provider>
    </UserContext.Provider>
  )
}
