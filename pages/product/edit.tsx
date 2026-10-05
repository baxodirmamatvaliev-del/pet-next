import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import CreateProduct from '../../libs/components/product/CreateProduct';

const EditProductPage = () => <CreateProduct mode="edit" />;

export default withLayoutBasic(EditProductPage);
