import type { Metadata } from 'next';
import './globals.css';
import './sections.css';
import './booking.css';
export const metadata:Metadata={title:'Toxicles — Tattoos by Tox',description:'Traditional • Japanese • Custom Tattoos by Tox. Tattoo book, flash designs, artworks, studio, shop and guest spots.',icons:{icon:'/favicon.png',apple:'/apple-touch-icon.png'},robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
