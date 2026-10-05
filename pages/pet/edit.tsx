import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import CreatePet from '../../libs/components/pet/CreatePet';

const EditPetPage = () => <CreatePet mode="edit" />;

export default withLayoutBasic(EditPetPage);
