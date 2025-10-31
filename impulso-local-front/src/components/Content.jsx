import { useEffect } from 'react';

export default function Content() {
  useEffect(() => {
    // Agregar event listeners pasivos
    const addPassiveListeners = () => {
      const options = {
        passive: true
      };

      document.addEventListener('touchstart', () => {}, options);
      document.addEventListener('touchmove', () => {}, options);
      document.addEventListener('wheel', () => {}, options);
      document.addEventListener('scroll', () => {}, options);
    };

    addPassiveListeners();

    // Limpiar event listeners al desmontar
    return () => {
      document.removeEventListener('touchstart', () => {});
      document.removeEventListener('touchmove', () => {});
      document.removeEventListener('wheel', () => {});
      document.removeEventListener('scroll', () => {});
    };
  }, []);

  //Prueba
  return (
    <div className="content-wrapper">
      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              {/* Default box */}
              <div className="card">
                <div className="card-body text-center">
                  <div className="embed-responsive embed-responsive-16by9">
                    <iframe 
                      title="UsmeOrgulloLocal" 
                      width="600" 
                      height="373.5" 
                      className="embed-responsive-item" 
                      src="https://app.powerbi.com/view?r=eyJrIjoiMGY0YTVjMzUtYmFmNi00OTg4LWFiYjAtZjhlYWY0NTEzZmUwIiwidCI6IjgxNjQwZjgyLTVjNDAtNGI5Yi1hYWM2LWQzMjM4ODQ2NjcxMSIsImMiOjR9&pageName=dd0380d69c48777d5fff" 
                      frameborder="0" 
                      allowFullScreen="true">
                    </iframe>
                  </div>
                </div>
                {/* /.card-body */}
              </div>
              {/* /.card */}
            </div>
          </div>
        </div>
      </section>
      {/* /.content */}
    </div>
  );
}
