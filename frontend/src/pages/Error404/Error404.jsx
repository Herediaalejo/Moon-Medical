import styles from './Error404.module.css'
import { useRouteError } from 'react-router-dom';

const Error404 = () => {
    const error = useRouteError();
    console.error(error)

    return (
        <div className={styles.error}>
            <h3 className={styles.title}>Ops! Error {error.status || ''}</h3>
            <p className={styles.description}>{error.data || ''}</p>
        </div>
    )
}

export default Error404;