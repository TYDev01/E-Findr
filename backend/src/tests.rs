#[cfg(test)]
mod tests {
    use crate::services::auth::{hash_password, verify_password};

    #[test]
    fn password_hash_roundtrip() {
        let password = "super-secure-password";
        let hash = hash_password(password).expect("hash");
        let valid = verify_password(password, &hash).expect("verify");
        assert!(valid);
    }
}
