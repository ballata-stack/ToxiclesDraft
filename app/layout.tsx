import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Toxicles — Traditional Tattoos',description:'Traditional tattoos by Tox. Browse flash, explore the work, find guest spots, and shop the next drop.',icons:{icon:'/images/toxicles-horses.png'},robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
