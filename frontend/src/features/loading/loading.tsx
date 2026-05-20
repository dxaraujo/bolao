type LoadingType = {
    show?: boolean
}

const loading = ({ show = true }: LoadingType) => {
    return (
        <div className='loading' style={{ display: show ? 'flex' : 'none'}}>
            <span className="loading-spinner" />
        </div>
    )
}

export default loading