import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import { useTranslation } from '../../i18n';

const videoId = 'exftKarulWg';

const PetVideo = () => {
	const { t } = useTranslation();

	return (
		<section className="pet-video container" aria-labelledby="pet-video-heading">
			<div className="pet-video__heading">
				<span className="pet-video__eyebrow"><PetsRoundedIcon aria-hidden="true" />{t('video.eyebrow')}</span>
				<h2 id="pet-video-heading">{t('video.heading')}</h2>
				<p>{t('video.description')}</p>
			</div>
			<div className="pet-video__player">
				<iframe
					src={`https://www.youtube.com/embed/${videoId}?rel=0&hl=ko&playsinline=1`}
					title={t('video.title')}
					loading="lazy"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					referrerPolicy="strict-origin-when-cross-origin"
					allowFullScreen
				/>
			</div>
			<div className="pet-video__credit">
				<span>소녀의행성 · GirlsPlanet</span>
			</div>
		</section>
	);
};

export default PetVideo;
