import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Image src="img/logo.png" className=" ml-6 mb-2" alt="Flames" width={120} height={120} />
            <p className="text-sm text-muted-foreground">
            Delicious pizza, burgers & submarines, short eats, pasta and deserts made with fresh ingredients and filled with love.
            </p>
            <div className="flex gap-4 mt-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Menu</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop?category=pizza" className="text-muted-foreground hover:text-primary">
                  Pizza
                </Link>
              </li>
              <li>
              <Link href="/shop?category=burgers-and-submarines" className="text-muted-foreground hover:text-primary">
            Burgers & Submarines
          </Link>
          </li>
          <li>
          <Link href="/shop?category=short-eats" className="text-muted-foreground hover:text-primary">
            Short Eats
          </Link>
          </li>
          <li>
          <Link href="/shop?category=pasta-corner" className="text-muted-foreground hover:text-primary">
            Pasta Corner
          </Link>
          </li>
          <li>
          <Link href="/shop?category=drinks-and-desserts" className="text-muted-foreground hover:text-primary">
            Drinks & Desserts
          </Link>
          </li>
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-primary">
                  View All
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <address className="not-italic text-sm text-muted-foreground">
              <p>123 Food Street</p>
              <p>Foodville, FD 12345</p>
              <p className="mt-2">Phone: (123) 456-7890</p>
              <p>Email: info@tastybites.com</p>
            </address>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Flames Pizzeria. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
