const InvalidToken = () => {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        marginTop: '20vh',
        justifyContent: 'center',
        fontSize: 'clamp(20px, 4vw, 42px)',
        fontFamily: 'monospace',
      }}
    >
      Please provide a valid token!
    </div>
  )
}

export default InvalidToken
