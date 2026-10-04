import Swal from 'sweetalert2';

export const sweetMixinErrorAlert = async (msg: string, duration: number = 3000) => {
	await Swal.fire({
		icon: 'error',
		title: msg,
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetTopSmallSuccessAlert = async (msg: string, duration: number = 2000) => {
	const toast = Swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: duration,
		timerProgressBar: true,
	});

	await toast.fire({
		icon: 'success',
		title: msg,
	});
};
