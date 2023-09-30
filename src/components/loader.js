import Image from 'next/image'
import React from 'react'

export default function Loader(props) {
    return (
        <div className='loader-wrapper'>
            <Image src="/loading.png" width={200} height={200} alt="Loading" priority />
        </div>
    )
}