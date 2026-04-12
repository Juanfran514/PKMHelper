import '../styles/SearchBar.css'

const SearchBar = ({value, onChange}) =>{
    return(
        <div className="search-container">
            <input 
                type="text" 
                placeholder="Buscar pokemon..." 
                className="search-input"
                maxLength={50}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
}

export default SearchBar