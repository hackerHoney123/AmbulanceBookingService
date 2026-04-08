const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const driverFields = document.getElementById('driverFields');

function toggleDriverFields() {
	const selectedRole = document.querySelector('input[name="role"]:checked');
	if (!selectedRole || !driverFields) {
		return;
	}
	driverFields.style.display = selectedRole.value === 'driver' ? 'grid' : 'none';
}

if (signUpButton && container) {
	signUpButton.addEventListener('click', () => {
		container.classList.add("right-panel-active");
	});
}

if (signInButton && container) {
	signInButton.addEventListener('click', () => {
		container.classList.remove("right-panel-active");
	});
}

document.querySelectorAll('input[name="role"]').forEach((input) => {
	input.addEventListener('change', toggleDriverFields);
});

toggleDriverFields();