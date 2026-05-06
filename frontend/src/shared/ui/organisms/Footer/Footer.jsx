import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-elevated">
      <div className="page-shell grid gap-lg py-xl md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">About</p>
          <div className="mt-sm flex flex-col gap-2 text-sm">
            <Link to={ROUTES.HOME} className="text-text-secondary hover:text-primary">About VMS</Link>
            <Link to={ROUTES.HOME} className="text-text-secondary hover:text-primary">Contact Us</Link>
            <Link to={ROUTES.HOME} className="text-text-secondary hover:text-primary">Careers</Link>
            <Link to={ROUTES.HOME} className="text-text-secondary hover:text-primary">Privacy Policy</Link>
            <Link to={ROUTES.HOME} className="text-text-secondary hover:text-primary">Terms of Service</Link>
          </div>
        </div>

   

      

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Social</p>
          <div className="mt-sm flex flex-col gap-2 text-sm text-text-secondary">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-primary">Facebook</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-primary">Instagram</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-primary">Twitter</a>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-sm text-center text-xs text-text-muted">
        Copyright {new Date().getFullYear()} VMS. All rights reserved.
      </div>
    </footer>
  )
}
