import React, { useState } from 'react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const validateForm = () => {
        const newErrors = {};
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Handle user login
            console.log('Logging in with:', { email, password });
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Login</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                    <label htmlFor="email" style={styles.label}>Email:</label>
                    <input 
                        type="email" 
                        id="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        style={styles.input} 
                    />
                    {errors.email && <span style={styles.error}>{errors.email}</span>}
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="password" style={styles.label}>Password:</label>
                    <input 
                        type="password" 
                        id="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        style={styles.input} 
                    />
                    {errors.password && <span style={styles.error}>{errors.password}</span>}
                </div>
                <button type="submit" style={styles.submitButton}>Login</button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    title: {
        marginBottom: '20px',
        color: '#333',
    },
    form: {
        width: '100%',
        maxWidth: '400px',
    },
    inputGroup: {
        marginBottom: '15px',
    },
    label: {
        marginBottom: '5px',
        display: 'block',
        color: '#333',
    },
    input: {
        padding: '10px',
        width: '100%',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    error: {
        color: 'red',
        fontSize: '12px',
    },
    submitButton: {
        padding: '10px',
        width: '100%',
        backgroundColor: '#007bff',
        border: 'none',
        borderRadius: '4px',
        color: 'white',
        cursor: 'pointer',
    },
};

export default LoginPage;
