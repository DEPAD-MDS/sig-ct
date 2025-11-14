import { useState } from "react"
import Modal from "~/components/Modal"

export default function Monitoramento(){
    const [isActive, setIsActive] = useState(false)
    return(
        <section>
            Monitoramento
             <button onClick={() => {setIsActive(true)}} className='cursor-pointer bg-white text-black py-2 px-4 rounded-xl'>Teste</button>
                        <Modal onClose={() => setIsActive(false)} isActive={isActive}>
                            <div>teste</div>
                        </Modal> 
        </section>
    )
}